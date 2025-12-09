package com.example.portoflio_android.data.network

import com.example.portoflio_android.data.models.ApiResponse
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import retrofit2.Response

object ErrorUtils {
    
    fun parseError(response: Response<*>): String {
        return try {
            val errorBody = response.errorBody()?.string()
            if (errorBody != null) {
                val gson = Gson()
                val type = object : TypeToken<ApiResponse<Any>>() {}.type
                val errorResponse: ApiResponse<Any>? = gson.fromJson(errorBody, type)
                errorResponse?.message ?: response.message()
            } else {
                response.message()
            }
        } catch (e: Exception) {
            response.message() ?: "Unknown error"
        }
    }
}
