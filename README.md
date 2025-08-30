# Book SaaS Backend API

A Node.js and Express.js backend API for the Book SaaS platform with Supabase authentication.

## Features

- 🔐 Complete authentication system (signup, signin, logout, password reset)
- 👤 User profile management
- 📚 Book management and user library
- 🛡️ Security middleware (helmet, CORS, rate limiting)
- 🚀 RESTful API design
- 📝 Comprehensive error handling

## Setup

1. **Install dependencies:**
   \`\`\`bash
   cd backend
   npm install
   \`\`\`

2. **Environment Configuration:**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
     - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

3. **Start the server:**
   \`\`\`bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   \`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/reset-password` - Send password reset email

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `DELETE /api/user/account` - Delete user account

### Books
- `GET /api/books` - Get all books (with pagination and search)
- `GET /api/books/:id` - Get single book
- `POST /api/books/:id/add-to-library` - Add book to user's library
- `GET /api/books/library/my-books` - Get user's book library

### Health Check
- `GET /health` - API health status

## Authentication

The API uses Supabase JWT tokens for authentication. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your_access_token>
\`\`\`

## Database Schema

You'll need these tables in your Supabase database:

\`\`\`sql
-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Books table
CREATE TABLE books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  category TEXT,
  cover_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User books (library)
CREATE TABLE user_books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);
\`\`\`

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Input validation
- JWT token verification
- Environment variable protection
