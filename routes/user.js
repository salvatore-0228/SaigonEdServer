import express from "express"
import { supabase } from "../config/supabase.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Get current user profile
router.get("/profile", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id

    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error && error.code !== "PGRST116") throw error

    res.json({
      user: req.user,
      profile: data || null,
    })
  } catch (error) {
    next(error)
  }
})

// Update user profile
router.put("/profile", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id
    const { first_name, last_name, avatar_url, bio } = req.body

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        first_name,
        last_name,
        full_name: `${first_name || ""} ${last_name || ""}`.trim(),
        avatar_url,
        bio,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    res.json({
      message: "Profile updated successfully",
      profile: data,
    })
  } catch (error) {
    next(error)
  }
})

// Delete user account
router.delete("/account", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id

    // Delete user data from profiles table
    await supabase.from("profiles").delete().eq("id", userId)

    // Note: Supabase doesn't allow deleting users via client SDK
    // This would need to be handled via Supabase Admin API or database triggers

    res.json({ message: "Account deletion initiated" })
  } catch (error) {
    next(error)
  }
})

export default router
