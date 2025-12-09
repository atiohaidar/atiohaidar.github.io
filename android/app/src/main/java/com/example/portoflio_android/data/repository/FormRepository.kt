package com.example.portoflio_android.data.repository

import com.example.portoflio_android.data.models.*
import com.example.portoflio_android.data.network.api.FormApiService
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FormRepository @Inject constructor(
    private val apiService: FormApiService
) {
    suspend fun getForms(): Result<List<Form>> {
        return try {
            val response = apiService.getForms()
            if (response.success) {
                Result.success(response.data)
            } else {
                Result.failure(Exception("Failed to get forms"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getForm(formId: String): Result<FormWithQuestions> {
        return try {
            val response = apiService.getForm(formId)
            if (response.success) {
                Result.success(response.data)
            } else {
                Result.failure(Exception("Failed to get form"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createForm(title: String, description: String?, questions: List<FormQuestionCreate>): Result<FormWithQuestions> {
        return try {
            val response = apiService.createForm(FormCreate(title, description, questions))
            if (response.success) {
                Result.success(response.data)
            } else {
                Result.failure(Exception("Failed to create form"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteForm(formId: String): Result<Unit> {
        return try {
            val response = apiService.deleteForm(formId)
            if (response.success) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to delete form"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getFormResponses(formId: String): Result<List<FormResponse>> {
        return try {
            val response = apiService.getFormResponses(formId)
            if (response.success) {
                Result.success(response.data)
            } else {
                Result.failure(Exception("Failed to get responses"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getFormResponseDetail(formId: String, responseId: String): Result<FormResponseDetail> {
        return try {
            val response = apiService.getFormResponseDetail(formId, responseId)
            if (response.success) {
                Result.success(response.data)
            } else {
                Result.failure(Exception("Failed to get response detail"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
