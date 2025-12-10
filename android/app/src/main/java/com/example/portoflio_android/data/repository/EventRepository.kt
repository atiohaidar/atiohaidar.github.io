package com.example.portoflio_android.data.repository

import com.example.portoflio_android.data.models.*
import com.example.portoflio_android.data.network.api.AttendanceScanRequest
import com.example.portoflio_android.data.network.api.EventAdminAssign
import com.example.portoflio_android.data.network.api.EventApiService
import com.example.portoflio_android.data.network.api.EventAttendeeRegister
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Event repository for event management.
 */
@Singleton
class EventRepository @Inject constructor(
    private val eventApiService: EventApiService
) {
    
    suspend fun getEvents(): Result<List<Event>> {
        return try {
            val response = eventApiService.getEvents()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(com.example.portoflio_android.data.network.ErrorUtils.parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getEvent(eventId: String): Result<Event> {
        return try {
            val response = eventApiService.getEvent(eventId)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(com.example.portoflio_android.data.network.ErrorUtils.parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createEvent(event: EventCreate): Result<Event> {
        return try {
            val response = eventApiService.createEvent(event)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(com.example.portoflio_android.data.network.ErrorUtils.parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteEvent(eventId: String): Result<Unit> {
        return try {
            val response = eventApiService.deleteEvent(eventId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(com.example.portoflio_android.data.network.ErrorUtils.parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun registerForEvent(eventId: String): Result<EventAttendee> {
        return try {
            val response = eventApiService.registerForEvent(EventAttendeeRegister(eventId))
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(com.example.portoflio_android.data.network.ErrorUtils.parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getAttendees(eventId: String): Result<List<EventAttendee>> {
        return try {
            val response = eventApiService.getAttendees(eventId)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(com.example.portoflio_android.data.network.ErrorUtils.parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Admin operations
    suspend fun getEventAdmins(eventId: String): Result<List<EventAdmin>> {
        return try {
            val response = eventApiService.getEventAdmins(eventId)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(com.example.portoflio_android.data.network.ErrorUtils.parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun assignEventAdmin(eventId: String, username: String): Result<EventAdmin> {
        return try {
            val response = eventApiService.assignEventAdmin(eventId, EventAdminAssign(username))
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(com.example.portoflio_android.data.network.ErrorUtils.parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun removeEventAdmin(eventId: String, username: String): Result<Unit> {
        return try {
            val response = eventApiService.removeEventAdmin(eventId, username)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(com.example.portoflio_android.data.network.ErrorUtils.parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Attendance scanning
    suspend fun scanAttendance(eventId: String, token: String): Result<AttendanceScan> {
        return try {
            val response = eventApiService.scanAttendance(eventId, AttendanceScanRequest(token))
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(com.example.portoflio_android.data.network.ErrorUtils.parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getScanHistory(eventId: String): Result<List<AttendanceScan>> {
        return try {
            val response = eventApiService.getScanHistory(eventId)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(com.example.portoflio_android.data.network.ErrorUtils.parseError(response)))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

