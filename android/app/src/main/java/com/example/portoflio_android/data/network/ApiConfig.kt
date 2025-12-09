package com.example.portoflio_android.data.network

/**
 * API configuration constants.
 */
object ApiConfig {
    // Use 10.0.2.2 for Android Emulator to access localhost
    const val BASE_URL_DEV = "https://backend.atiohaidar.workers.dev"
//    const val BASE_URL_DEV = "http://10.0.2.2:8787"

    const val BASE_URL_PROD = "https://backend.atiohaidar.workers.dev"
    
    // Toggle this for development vs production
    const val IS_PRODUCTION = false
    
    val BASE_URL: String
        get() = if (IS_PRODUCTION) BASE_URL_PROD else BASE_URL_DEV
}
