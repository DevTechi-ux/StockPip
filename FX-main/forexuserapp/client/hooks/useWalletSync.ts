import { useEffect } from 'react';
import { useTradingStore } from '@/state/trading-store';

export function useWalletSync() {
  const setWallet = useTradingStore(state => state.setWallet);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const token = localStorage.getItem('auth_token');

        const getUserId = () => {
          const j = localStorage.getItem('user');
          if (j) { try { const u = JSON.parse(j); if (u?.id) return u.id; } catch {} }
          if (token && token.includes('.')) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              if (payload?.userId) return payload.userId;
            } catch {}
          }
          return null;
        };

        // Primary: public balance endpoint by user id (no auth, always available)
        const uid = getUserId();
        if (uid) {
          const r2 = await fetch(`/api/user/balance/${uid}`);
          if (r2.ok) {
            const d2 = await r2.json();
            const balance = parseFloat(d2.balance) || 0;
            setWallet({
              balance,
              equity: parseFloat(d2.equity) || balance,
              marginUsed: 0,
              freeMargin: balance
            });
            return;
          }
        }

        // Secondary: secured account endpoint
        if (token) {
          const response = await fetch('/api/account', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            setWallet({
              balance: parseFloat(data.balance) || 0,
              equity: parseFloat(data.equity) || parseFloat(data.balance) || 0,
              marginUsed: parseFloat(data.margin) || 0,
              freeMargin: parseFloat(data.freeMargin) || parseFloat(data.balance) || 0
            });
            return;
          }
        }
        // If all calls failed, do not overwrite existing wallet silently
      } catch (error) {
        console.error('Error fetching wallet:', error);
        // As a last resort, keep previous values; do not force zeros here
      }
    };

    fetchWallet();
    
    // Refresh wallet every 10 seconds
    const interval = setInterval(fetchWallet, 10000);
    
    return () => clearInterval(interval);
  }, [setWallet]);
}

