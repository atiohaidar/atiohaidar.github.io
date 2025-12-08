import 'package:equatable/equatable.dart';

/// Form question model
class FormQuestion extends Equatable {
  final String id;
  final String formId;
  final String questionText;
  final int questionOrder;
  final String? createdAt;

  const FormQuestion({
    required this.id,
    required this.formId,
    required this.questionText,
    required this.questionOrder,
    this.createdAt,
  });

  factory FormQuestion.fromJson(Map<String, dynamic> json) {
    return FormQuestion(
      id: json['id'] as String,
      formId: json['form_id'] as String,
      questionText: json['question_text'] as String,
      questionOrder: json['question_order'] as int,
      createdAt: json['created_at'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'form_id': formId,
      'question_text': questionText,
      'question_order': questionOrder,
      if (createdAt != null) 'created_at': createdAt,
    };
  }

  @override
  List<Object?> get props => [id, formId, questionText, questionOrder, createdAt];
}

/// Form model
class FormData extends Equatable {
  final String id;
  final String title;
  final String? description;
  final String token;
  final String createdBy;
  final String? createdAt;
  final String? updatedAt;

  const FormData({
    required this.id,
    required this.title,
    this.description,
    required this.token,
    required this.createdBy,
    this.createdAt,
    this.updatedAt,
  });

  factory FormData.fromJson(Map<String, dynamic> json) {
    return FormData(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      token: json['token'] as String,
      createdBy: json['created_by'] as String,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      if (description != null) 'description': description,
      'token': token,
      'created_by': createdBy,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
    };
  }

  @override
  List<Object?> get props => [id, title, description, token, createdBy, createdAt, updatedAt];
}

/// Form with questions model
class FormWithQuestions extends Equatable {
  final FormData form;
  final List<FormQuestion> questions;

  const FormWithQuestions({
    required this.form,
    required this.questions,
  });

  factory FormWithQuestions.fromJson(Map<String, dynamic> json) {
    return FormWithQuestions(
      form: FormData.fromJson(json['form']),
      questions: (json['questions'] as List)
          .map((q) => FormQuestion.fromJson(q))
          .toList(),
    );
  }

  @override
  List<Object?> get props => [form, questions];
}

/// Question create model
class QuestionCreate {
  final String questionText;
  final int questionOrder;

  const QuestionCreate({
    required this.questionText,
    required this.questionOrder,
  });

  Map<String, dynamic> toJson() {
    return {
      'question_text': questionText,
      'question_order': questionOrder,
    };
  }
}

/// Form create request
class FormCreate {
  final String title;
  final String? description;
  final List<QuestionCreate> questions;

  const FormCreate({
    required this.title,
    this.description,
    required this.questions,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      if (description != null) 'description': description,
      'questions': questions.map((q) => q.toJson()).toList(),
    };
  }
}

/// Form response model
class FormResponse extends Equatable {
  final String id;
  final String formId;
  final String? respondentName;
  final String? submittedAt;

  const FormResponse({
    required this.id,
    required this.formId,
    this.respondentName,
    this.submittedAt,
  });

  factory FormResponse.fromJson(Map<String, dynamic> json) {
    return FormResponse(
      id: json['id'] as String,
      formId: json['form_id'] as String,
      respondentName: json['respondent_name'] as String?,
      submittedAt: json['submitted_at'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, formId, respondentName, submittedAt];
}

/// Form answer model
class FormAnswer extends Equatable {
  final String questionId;
  final String questionText;
  final String answerText;

  const FormAnswer({
    required this.questionId,
    required this.questionText,
    required this.answerText,
  });

  factory FormAnswer.fromJson(Map<String, dynamic> json) {
    return FormAnswer(
      questionId: json['question_id'] as String,
      questionText: json['question_text'] as String,
      answerText: json['answer_text'] as String,
    );
  }

  @override
  List<Object?> get props => [questionId, questionText, answerText];
}

/// Form response detail
class FormResponseDetail extends Equatable {
  final FormResponse response;
  final List<FormAnswer> answers;

  const FormResponseDetail({
    required this.response,
    required this.answers,
  });

  factory FormResponseDetail.fromJson(Map<String, dynamic> json) {
    return FormResponseDetail(
      response: FormResponse.fromJson(json['response']),
      answers: (json['answers'] as List)
          .map((a) => FormAnswer.fromJson(a))
          .toList(),
    );
  }

  @override
  List<Object?> get props => [response, answers];
}

/// Answer create model
class AnswerCreate {
  final String questionId;
  final String answerText;

  const AnswerCreate({
    required this.questionId,
    required this.answerText,
  });

  Map<String, dynamic> toJson() {
    return {
      'question_id': questionId,
      'answer_text': answerText,
    };
  }
}

/// Form response create request
class FormResponseCreate {
  final String? respondentName;
  final List<AnswerCreate> answers;

  const FormResponseCreate({
    this.respondentName,
    required this.answers,
  });

  Map<String, dynamic> toJson() {
    return {
      if (respondentName != null) 'respondent_name': respondentName,
      'answers': answers.map((a) => a.toJson()).toList(),
    };
  }
}
