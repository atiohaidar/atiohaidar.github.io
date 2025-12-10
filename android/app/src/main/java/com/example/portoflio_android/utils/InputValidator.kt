package com.example.portoflio_android.utils

/**
 * Input validation utilities for forms without external libraries
 */
object InputValidator {
    
    fun validateTitle(title: String): String? {
        return when {
            title.isBlank() -> "Title cannot be empty"
            title.length < 3 -> "Title must be at least 3 characters"
            title.length > 200 -> "Title is too long (max 200 characters)"
            else -> null
        }
    }
    
    fun validateDescription(description: String, required: Boolean = false): String? {
        return when {
            required && description.isBlank() -> "Description cannot be empty"
            description.length > 1000 -> "Description is too long (max 1000 characters)"
            else -> null
        }
    }
    
    fun validateEmail(email: String): String? {
        return when {
            email.isBlank() -> "Email cannot be empty"
            !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches() -> "Invalid email format"
            else -> null
        }
    }
    
    fun validatePassword(password: String): String? {
        return when {
            password.isBlank() -> "Password cannot be empty"
            password.length < 6 -> "Password must be at least 6 characters"
            else -> null
        }
    }
    
    fun validateUsername(username: String): String? {
        return when {
            username.isBlank() -> "Username cannot be empty"
            username.length < 3 -> "Username must be at least 3 characters"
            username.length > 50 -> "Username is too long (max 50 characters)"
            !username.matches(Regex("^[a-zA-Z0-9_]+$")) -> "Username can only contain letters, numbers, and underscores"
            else -> null
        }
    }
    
    fun validateLocation(location: String, required: Boolean = false): String? {
        return when {
            required && location.isBlank() -> "Location cannot be empty"
            location.length > 200 -> "Location is too long (max 200 characters)"
            else -> null
        }
    }
    
    fun validateDate(dateMillis: Long?): String? {
        return when {
            dateMillis == null -> "Please select a date"
            dateMillis < System.currentTimeMillis() -> "Date cannot be in the past"
            else -> null
        }
    }
    
    fun validateDateRange(startMillis: Long?, endMillis: Long?): String? {
        return when {
            startMillis == null -> "Please select a start date"
            endMillis == null -> "Please select an end date"
            startMillis >= endMillis -> "End date must be after start date"
            startMillis < System.currentTimeMillis() -> "Start date cannot be in the past"
            else -> null
        }
    }
    
    fun validatePurpose(purpose: String, required: Boolean = false): String? {
        return when {
            required && purpose.isBlank() -> "Purpose cannot be empty"
            purpose.length > 500 -> "Purpose is too long (max 500 characters)"
            else -> null
        }
    }
    
    fun sanitizeInput(input: String): String {
        // Remove potential SQL injection and XSS characters
        return input.trim()
            .replace("'", "")
            .replace("\"", "")
            .replace("<", "")
            .replace(">", "")
            .replace("&", "")
    }
}
