export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err)

  // Default error
  let error = {
    status: err.status || 500,
    message: err.message || "Internal Server Error",
  }

  // Supabase specific errors
  if (err.code) {
    switch (err.code) {
      case "invalid_credentials":
        error = {
          status: 401,
          message: "Invalid email or password",
        }
        break
      case "email_not_confirmed":
        error = {
          status: 400,
          message: "Please confirm your email address",
        }
        break
      case "signup_disabled":
        error = {
          status: 403,
          message: "Sign up is currently disabled",
        }
        break
      default:
        error = {
          status: 400,
          message: err.message,
        }
    }
  }

  // Validation errors
  if (err.name === "ValidationError") {
    error = {
      status: 400,
      message: "Validation Error",
      details: err.details,
    }
  }

  res.status(error.status).json({
    error: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    ...(error.details && { details: error.details }),
  })
}
