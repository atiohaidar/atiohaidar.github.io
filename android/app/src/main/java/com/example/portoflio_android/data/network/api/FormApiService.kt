package com.example.portoflio_android.data.network.api

import com.example.portoflio_android.data.models.*
import retrofit2.http.*

/**
 * Form API service for form/questionnaire management.
 */
interface FormApiService {
    
    @GET("/api/forms")
    suspend fun getForms(): FormsListResponse
    
    @GET("/api/forms/{formId}")
    suspend fun getForm(@Path("formId") formId: String): FormDetailResponse
    
    @GET("/api/public/forms/{token}")
    suspend fun getFormByToken(@Path("token") token: String): FormDetailResponse
    
    @POST("/api/forms")
    suspend fun createForm(@Body form: FormCreate): FormDetailResponse
    
    @PUT("/api/forms/{formId}")
    suspend fun updateForm(
        @Path("formId") formId: String,
        @Body updates: FormUpdate
    ): FormDetailResponse
    
    @DELETE("/api/forms/{formId}")
    suspend fun deleteForm(@Path("formId") formId: String): ApiResponse<Unit>
    
    @GET("/api/forms/{formId}/responses")
    suspend fun getFormResponses(@Path("formId") formId: String): FormResponsesListResponse
    
    @GET("/api/forms/{formId}/responses/{responseId}")
    suspend fun getFormResponseDetail(
        @Path("formId") formId: String,
        @Path("responseId") responseId: String
    ): FormResponseDetailResponse
    
    @POST("/api/public/forms/{token}/submit")
    suspend fun submitFormResponse(
        @Path("token") token: String,
        @Body response: FormResponseCreate
    ): ApiResponse<Unit>
}
