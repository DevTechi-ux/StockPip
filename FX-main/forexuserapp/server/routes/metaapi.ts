import { RequestHandler } from "express";
import MetaApi from 'metaapi.cloud-sdk';

const token = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJiYmRlZGVjYWJjMDAzOTczNTQ3ODk2Y2NlYjgyNzY2NSIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiXSwicmVzb3VyY2VzIjpbImFjY291bnQ6JFVTRVJfSUQkOmY4YmFhYzkwLWY4MGYtNDFkMy1iODQxLTVmN2IxMjBiMTZjOCJdfSx7ImlkIjoibWV0YWFwaS1yZXN0LWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiYWNjb3VudDokVVNFUl9JRCQ6ZjhiYWFjOTAtZjgwZi00MWQzLWI4NDEtNWY3YjEyMGIxNmM4Il19LHsiaWQiOiJtZXRhYXBpLXJwYy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyJhY2NvdW50OiRVU0VSX0lEJDpmOGJhYWM5MC1mODBmLTQxZDMtYjg0MS01ZjdiMTIwYjE2YzgiXX0seyJpZCI6Im1ldGFhcGktcmVhbC10aW1lLXN0cmVhbWluZy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyJhY2NvdW50OiRVU0VSX0lEJDpmOGJhYWM5MC1mODBmLTQxZDMtYjg0MS01ZjdiMTIwYjE2YzgiXX0seyJpZCI6Im1ldGFzdGF0cy1hcGkiLCJtZXRob2RzIjpbIm1ldGFzdGF0cy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiYWNjb3VudDokVVNFUl9JRCQ6ZjhiYWFjOTAtZjgwZi00MWQzLWI4NDEtNWY7YjEyMGIxNmM4Il19LHsiaWQiOiJyaXNrLW1hbmFnZW1lbnQtYXBpIiwibWV0aG9kcyI6WyJyaXNrLW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiXSwicmVzb3VyY2VzIjpbImFjY291bnQ6JFVTRVJfSUQkOmY4YmFhYzkwLWY4MGYtNDFkMy1iODQxLTVmN2IxMjBiMTZjOCJdfV0sImlnbm9yZVJhdGVMaW1pdHMiOmZhbHNlLCJ0b2tlbklkIjoiMjAyMTAyMTMiLCJpbXBlcnNvbmF0ZWQiOmZhbHNlLCJyZWFsVXNlcklkIjoiYmJkZWRlY2FiYzAwMzk3MzU0Nzg5NmNjZWI4Mjc2NjUiLCJpYXQiOjE3NjE0NzAyNTgsImV4cCI6MTc2OTI0NjI1OH0.FGAsLfLdZbhguLnIWzCbgKR4rzpnoKr87jJ-hdl-Pu9NfFl_gSJO8TtVkDc6oiWRD4bbiDFM8906KZVHeaQJokucYb_iEnaIVY6JLHsjP-E_yTE_2oNO-X5NR2Toe1-91BQU79D2USaU4LknLe6iOClH0O2qz1ciu8i7l2--07YpLZOn6ivYGtd2Tb9Ts9-eRxBJmd5qTM_yscLkxBOL_K9ihowAA-t6m6Ia-RCevNpBi4287VThlPUxNgR5v1O8dkNDaT-jiT_AtUA9PGyet8gwLwD_cgedfyybk4myFtznw3Kp-NNOzInbFeCaLzk5tcNvv89nhfdr2irs-7R0uT1jIu1WTyaHP-b4cm8vrODlrKod_2Ap4K8-FItgnKBaKA3IQwhx36Q2lIjuiKnaNsyhZjQJvRkgQ27wSTkYDp0_f8gv8Az4RfPNru9Ah-Db0iSC5FavDv46gkSqSUxnsC0Yo9edv0YjcD4C_razdymbZn4uRacQurBAd3We_JxhB0lWwRKCGgrJDw8G1M42YNr3DkjcoFGWKCUkUeA8os7s1iDBUmxtRt4FSwZj2IAuNR-z5bdOSHgBXI5RCX1icFDQthyIYRLPr225LfPB3wKsqmG4ClnkyfDdPikWveTJkukerbBXQ-5jiJ8mxTol8LfotoVrCJ3HiWVQiIw7wLI';
const accountId = 'f8baac90-f80f-41d3-b841-5f7b120b16c8';

let metaApi: any = null;
let account: any = null;
let connection: any = null;

async function initializeMetaAPI() {
  try {
    metaApi = new MetaApi(token);
    account = await metaApi.metatraderAccountApi.getAccount(accountId);
    await account.waitConnected();
    connection = account.getStreamingConnection();
    await connection.connect();
    await connection.waitSynchronized();
    console.log('MetaAPI connected successfully');
  } catch (error) {
    console.error('MetaAPI initialization error:', error);
  }
}

// Initialize on startup
initializeMetaAPI();

export const getPrices: RequestHandler = async (req, res) => {
  try {
    if (!connection) {
      return res.status(500).json({ error: 'MetaAPI not connected' });
    }

    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD'];
    const prices: any = {};

    for (const symbol of symbols) {
      try {
        const price = await connection.getSymbolPrice(symbol);
        if (price) {
          prices[symbol] = {
            bid: price.bid,
            ask: price.ask,
            spread: price.ask - price.bid,
            time: price.time
          };
        }
      } catch (error) {
        console.error(`Error getting price for ${symbol}:`, error);
      }
    }

    res.json(prices);
  } catch (error) {
    console.error('Error getting prices:', error);
    res.status(500).json({ error: 'Failed to get prices' });
  }
};

export const getAccountInfo: RequestHandler = async (req, res) => {
  try {
    if (!connection) {
      return res.status(500).json({ error: 'MetaAPI not connected' });
    }

    const accountInfo = await connection.getAccountInformation();
    
    res.json({
      balance: accountInfo.balance,
      equity: accountInfo.equity,
      margin: accountInfo.margin,
      freeMargin: accountInfo.freeMargin,
      marginLevel: accountInfo.marginLevel,
      currency: accountInfo.currency,
      leverage: accountInfo.leverage
    });
  } catch (error) {
    console.error('Error getting account info:', error);
    res.status(500).json({ error: 'Failed to get account info' });
  }
};

export const getPositions: RequestHandler = async (req, res) => {
  try {
    if (!connection) {
      return res.status(500).json({ error: 'MetaAPI not connected' });
    }

    const positions = await connection.getPositions();
    
    const formattedPositions = positions.map((pos: any) => ({
      id: pos.id,
      symbol: pos.symbol,
      side: pos.type,
      volume: pos.volume,
      openPrice: pos.openPrice,
      currentPrice: pos.currentPrice,
      profit: pos.profit,
      swap: pos.swap,
      commission: pos.commission,
      unrealizedProfit: pos.unrealizedProfit,
      time: pos.time
    }));

    res.json(formattedPositions);
  } catch (error) {
    console.error('Error getting positions:', error);
    res.status(500).json({ error: 'Failed to get positions' });
  }
};

