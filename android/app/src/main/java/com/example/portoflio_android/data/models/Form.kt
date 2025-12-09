package com.example.portoflio_android.data.models

import com.google.gson.annotations.SerializedName

/**
 * Form data classes for form/questionnaire management.
 */
data class Form(
    val id: String,
    val title: String,
    val description: String? = null,
    val token: String,
    @SerializedName("created_by")
    val createdBy: String,
    @SerializedName("created_at")
    val createdAt: String? = null,
    @SerializedName("updated_at")
    val updatedAt: String? = null
)

data class FormQuestion(
    val id: String,
    @SerializedName("form_id")
    val formId: String,
    @SerializedName("question_text")
    val questionText: String,
    @SerializedName("question_order")
    val questionOrder: Int,
    @SerializedName("created_at")
    val createdAt: String? = null
)

data class FormWithQuestions(
    val form: Form,
    val questions: List<FormQuestion>
)

data class FormQuestionCreate(
    @SerializedName("question_text")
    val questionText: String,
    @SerializedName("question_order")
    val questionOrder: Int
)

data class FormCreate(
    val title: String,
    val description: String? = null,
    val questions: List<FormQuestionCreate>
)

data class FormUpdate(
    val title: String? = null,
    val description: String? = null,
    val questions: List<FormQuestionCreate>? = null
)

data class FormResponse(
    val id: String,
    @SerializedName("form_id")
    val formId: String,
    @SerializedName("respondent_name")
    val respondentName: String? = null,
    @SerializedName("submitted_at")
    val submittedAt: String? = null
)

data class FormAnswer(
    @SerializedName("question_id")
    val questionId: String,
    @SerializedName("question_text")
    val questionText: String,
    @SerializedName("answer_text")
    val answerText: String
)

data class FormResponseDetail(
    val response: FormResponse,
    val answers: List<FormAnswer>
)

data class FormAnswerCreate(
    @SerializedName("question_id")
    val questionId: String,
    @SerializedName("answer_text")
    val answerText: String
)

data class FormResponseCreate(
    @SerializedName("respondent_name")
    val respondentName: String? = null,
    val answers: List<FormAnswerCreate>
)

// API Response wrappers
data class FormsListResponse(
    val success: Boolean,
    val data: List<Form>
)

data class FormDetailResponse(
    val success: Boolean,
    val data: FormWithQuestions
)

data class FormResponsesListResponse(
    val success: Boolean,
    val data: List<FormResponse>
)

data class FormResponseDetailResponse(
    val success: Boolean,
    val data: FormResponseDetail
)
