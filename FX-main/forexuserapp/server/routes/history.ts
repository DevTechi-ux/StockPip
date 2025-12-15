import { RequestHandler } from "express";
import { executeQuery } from "../database";

// Get trading history for a user
export const getTradingHistory: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await executeQuery(
      `SELECT * FROM trading_history 
       WHERE user_id = ? 
       ORDER BY close_time DESC 
       LIMIT 500`,
      [userId]
    );

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: "Failed to fetch trading history" });
    }
  } catch (error: any) {
    console.error("Error fetching trading history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

