import { RequestHandler } from "express";
import { executeQuery } from "../database";
import crypto from "crypto";

export const createTicket: RequestHandler = async (req, res) => {
  try {
    const { userId, subject, message, category, priority } = req.body;
    
    if (!userId || !subject || !message) {
      return res.status(400).json({ error: "userId, subject, and message are required" });
    }
    
    const ticketId = crypto.randomBytes(16).toString('hex');
    
    const insertQuery = `
      INSERT INTO support_tickets (id, user_id, subject, message, category, priority, status) 
      VALUES (?, ?, ?, ?, ?, ?, 'open')
    `;
    
    const result = await executeQuery(insertQuery, [
      ticketId,
      userId,
      subject,
      message,
      category || 'general',
      priority || 'medium'
    ]);
    
    console.log('Ticket creation result:', result);
    
    if (result.success) {
      // Create notification for admin
      await executeQuery(
        'INSERT INTO notifications (user_id, type, title, message, data, priority, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [
          'admin-001', // Admin user ID
          'support',
          'New Support Ticket',
          `New ticket from user: ${subject}`,
          JSON.stringify({
            ticket_id: ticketId,
            user_id: userId,
            category: category || 'general',
            priority: priority || 'medium'
          }),
          priority || 'medium'
        ]
      );
      
      return res.json({ success: true, id: ticketId, status: "open" });
    } else {
      console.error('Failed to create ticket. Result:', result);
      return res.status(500).json({ error: "Failed to create ticket", details: result.error || 'Unknown error' });
    }
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

export const getUserTickets: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    
    const result = await executeQuery(
      'SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    if (result.success) {
      return res.json({ success: true, tickets: result.data || [] });
    } else {
      return res.status(500).json({ error: "Failed to fetch tickets" });
    }
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
