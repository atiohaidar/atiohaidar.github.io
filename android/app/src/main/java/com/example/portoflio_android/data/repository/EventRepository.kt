package com.example.portoflio_android.data.repository

import com.example.portoflio_android.data.models.*
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
                Result.failure(Exception(response.message() ?: "Failed to get events"))
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
                Result.failure(Exception(response.message() ?: "Failed to get event"))
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
                Result.failure(Exception(response.message() ?: "Failed to create event"))
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
                Result.failure(Exception(response.message() ?: "Failed to register"))
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
                Result.failure(Exception(response.message() ?: "Failed to get attendees"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
