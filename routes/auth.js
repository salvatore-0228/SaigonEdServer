import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabaseClient } from "../config/supabase.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Sign up
router.post("/signup", async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    console.log(email, password, name);

    if (!email || !password) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Email and password are required",
      });
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          password: password,
          name: name,
        },
      },
    });

    if (error) throw error;

    res.status(201).json({
      data: {
        message: "User created successfully",
        user: data.user,
        session: data.session,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Sign in
router.post("/signin", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log(req.body);

    if (!username || !password) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Username and password are required",
      });
    }

    // 1. Find user by username
    const { data: user, error } = await supabaseClient
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "User not found",
      });
    }

    // 2. Check password
    // const valid = await bcrypt.compare(password, user.password_hash);
    const valid = (password === user.password_hash);
    if (!valid) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Wrong password",
      });
    }

    // 3. Create JWT
    const token = jwt.sign(
      {
        sub: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET, // make sure this matches your Supabase JWT secret
      { expiresIn: "1h" }
    );

    // 4. Return response
    res.json({
      data: {
        message: "Signed in successfully",
        user: {
          id: user.id,
          username: user.username,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Sign out
router.post("/signout", authenticateToken, async (req, res, next) => {
  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) throw error;

    res.json({ message: "Signed out successfully" });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post("/refresh", async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: "Missing refresh token",
        message: "Refresh token is required",
      });
    }

    const { data, error } = await supabaseClient.auth.refreshSession({
      refresh_token,
    });

    if (error) throw error;

    res.json({
      message: "Token refreshed successfully",
      session: data.session,
    });
  } catch (error) {
    next(error);
  }
});

// Reset password
router.post("/reset-password", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Missing email",
        message: "Email is required",
      });
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    if (error) throw error;

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    next(error);
  }
});

export default router;
