import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { getUserByEmail, createUser, updateUserLastLogin } from "../database";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export const register: RequestHandler = async (req, res) => {
  try {
    const { firstName, lastName, email, password, ibReferralCode } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Generate user ID
    const userId = randomBytes(16).toString("hex");
    
    // Create user in MySQL
    const userResult = await createUser({
      id: userId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      userType: 'user',
      ibReferralCode: ibReferralCode || null
    });

    if (!userResult.success) {
      console.error('User registration failed:', {
        error: userResult.error,
        errorMessage: userResult.errorMessage,
        errorCode: userResult.errorCode,
        email: email
      });
      const errorMessage = userResult.errorMessage || (userResult.error instanceof Error ? userResult.error.message : String(userResult.error));
      return res.status(500).json({ 
        message: "Failed to create user",
        error: errorMessage,
        errorCode: userResult.errorCode
      });
    }

    // If IB referral code provided, create referral tracking
    if (ibReferralCode) {
      const { executeQuery } = require("../database");
      
      // Find IB account by referral code
      const ibResult = await executeQuery(
        'SELECT id FROM ib_accounts WHERE referral_code = ? AND status = "approved" AND is_active = TRUE',
        [ibReferralCode]
      );

      if (ibResult.success && ibResult.data.length > 0) {
        const ibId = ibResult.data[0].id;
        
        // Link user to IB
        await executeQuery(
          'UPDATE users SET ib_id = ?, ib_referral_code = ? WHERE id = ?',
          [ibId, ibReferralCode, userId]
        );

        // Create referral tracking entry
        await executeQuery(
          `INSERT INTO ib_referrals (id, ib_id, referred_user_id, referral_code, total_trades, total_lots, total_commission)
           VALUES (?, ?, ?, ?, 0, 0.00, 0.00)`,
          [randomBytes(16).toString("hex"), ibId, userId, ibReferralCode]
        );

        // Update IB total clients count
        await executeQuery(
          'UPDATE ib_accounts SET total_clients = total_clients + 1 WHERE id = ?',
          [ibId]
        );

        console.log(`User ${userId} registered with IB ${ibId}`);
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId, email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: userId,
        firstName,
        lastName,
        email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Get user from MySQL
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update last login
    await updateUserLastLogin(user.id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        userType: user.user_type,
        accountType: user.account_type,
        leverage: user.leverage,
        is_verified: user.is_verified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyToken: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};