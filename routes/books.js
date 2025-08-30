import express from "express"
import { supabase } from "../config/supabase.js"
import { authenticateToken, optionalAuth } from "../middleware/auth.js"

const router = express.Router()

// Get all books (public)
router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query
    const offset = (page - 1) * limit

    let query = supabase
      .from("books")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error, count } = await query

    if (error) throw error

    res.json({
      books: data,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    next(error)
  }
})

// Get single book
router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase.from("books").select("*").eq("id", id).single()

    if (error) throw error

    if (!data) {
      return res.status(404).json({
        error: "Book not found",
        message: "The requested book does not exist",
      })
    }

    res.json({ book: data })
  } catch (error) {
    next(error)
  }
})

// Add book to user's library (protected)
router.post("/:id/add-to-library", authenticateToken, async (req, res, next) => {
  try {
    const { id: bookId } = req.params
    const userId = req.user.id

    const { data, error } = await supabase
      .from("user_books")
      .upsert({
        user_id: userId,
        book_id: bookId,
        added_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    res.json({
      message: "Book added to library",
      userBook: data,
    })
  } catch (error) {
    next(error)
  }
})

// Get user's library (protected)
router.get("/library/my-books", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id

    const { data, error } = await supabase
      .from("user_books")
      .select(`
        *,
        books (*)
      `)
      .eq("user_id", userId)

    if (error) throw error

    res.json({ library: data })
  } catch (error) {
    next(error)
  }
})

export default router
