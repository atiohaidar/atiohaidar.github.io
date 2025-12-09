package com.example.portoflio_android.data.repository

import com.example.portoflio_android.data.models.*
import com.example.portoflio_android.data.network.api.RoomApiService
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Room and Booking repository.
 */
@Singleton
class RoomRepository @Inject constructor(
    private val roomApiService: RoomApiService
) {
    
    // ==================== Room Operations ====================
    
    suspend fun getRooms(available: Boolean? = null): Result<List<Room>> {
        return try {
            val response = roomApiService.getRooms(available)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(com.example.portoflio_android.data.network.ErrorUtils.parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getRoom(roomId: String): Result<Room> {
        return try {
            val response = roomApiService.getRoom(roomId)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(com.example.portoflio_android.data.network.ErrorUtils.parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createRoom(room: RoomCreate): Result<Room> {
        return try {
            val response = roomApiService.createRoom(room)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(com.example.portoflio_android.data.network.ErrorUtils.parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // ==================== Booking Operations ====================
    
    suspend fun getBookings(roomId: String? = null, status: String? = null): Result<List<Booking>> {
        return try {
            val response = roomApiService.getBookings(roomId, status)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(com.example.portoflio_android.data.network.ErrorUtils.parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createBooking(booking: BookingCreate): Result<Booking> {
        return try {
            val response = roomApiService.createBooking(booking)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(com.example.portoflio_android.data.network.ErrorUtils.parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateBookingStatus(bookingId: String, status: BookingStatus): Result<Booking> {
        return try {
            val response = roomApiService.updateBookingStatus(
                bookingId, 
                com.example.portoflio_android.data.network.api.BookingStatusUpdate(status.name.lowercase())
            )
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(com.example.portoflio_android.data.network.ErrorUtils.parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun cancelBooking(bookingId: String): Result<Unit> {
        return try {
            val response = roomApiService.cancelBooking(bookingId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(com.example.portoflio_android.data.network.ErrorUtils.parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
