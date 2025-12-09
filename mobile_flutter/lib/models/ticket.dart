import 'package:equatable/equatable.dart';

/// Ticket status enum
enum TicketStatus { open, inProgress, waiting, solved }

extension TicketStatusExtension on TicketStatus {
  String get value {
    switch (this) {
      case TicketStatus.open:
        return 'open';
      case TicketStatus.inProgress:
        return 'in_progress';
      case TicketStatus.waiting:
        return 'waiting';
      case TicketStatus.solved:
        return 'solved';
    }
  }

  static TicketStatus fromString(String value) {
    switch (value) {
      case 'in_progress':
        return TicketStatus.inProgress;
      case 'waiting':
        return TicketStatus.waiting;
      case 'solved':
        return TicketStatus.solved;
      default:
        return TicketStatus.open;
    }
  }
}

/// Ticket priority enum
enum TicketPriority { low, medium, high, critical }

extension TicketPriorityExtension on TicketPriority {
  String get value {
    switch (this) {
      case TicketPriority.low:
        return 'low';
      case TicketPriority.medium:
        return 'medium';
      case TicketPriority.high:
        return 'high';
      case TicketPriority.critical:
        return 'critical';
    }
  }

  static TicketPriority fromString(String value) {
    switch (value) {
      case 'medium':
        return TicketPriority.medium;
      case 'high':
        return TicketPriority.high;
      case 'critical':
        return TicketPriority.critical;
      default:
        return TicketPriority.low;
    }
  }
}

/// Ticket category model
class TicketCategory extends Equatable {
  final int id;
  final String name;
  final String? description;
  final String? createdAt;

  const TicketCategory({
    required this.id,
    required this.name,
    this.description,
    this.createdAt,
  });

  factory TicketCategory.fromJson(Map<String, dynamic> json) {
    return TicketCategory(
      id: json['id'] as int,
      name: json['name'] as String,
      description: json['description'] as String?,
      createdAt: json['created_at'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, name, description, createdAt];
}

/// Ticket model
class Ticket extends Equatable {
  final int id;
  final String token;
  final String title;
  final String description;
  final int categoryId;
  final String? categoryName;
  final TicketStatus status;
  final TicketPriority priority;
  final String? submitterName;
  final String? submitterEmail;
  final String? referenceLink;
  final String? assignedTo;
  final String? createdAt;
  final String? updatedAt;

  const Ticket({
    required this.id,
    required this.token,
    required this.title,
    required this.description,
    required this.categoryId,
    this.categoryName,
    required this.status,
    required this.priority,
    this.submitterName,
    this.submitterEmail,
    this.referenceLink,
    this.assignedTo,
    this.createdAt,
    this.updatedAt,
  });

  factory Ticket.fromJson(Map<String, dynamic> json) {
    return Ticket(
      id: json['id'] as int,
      token: json['token'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      categoryId: json['category_id'] as int,
      categoryName: json['category_name'] as String?,
      status: TicketStatusExtension.fromString(json['status'] as String),
      priority: TicketPriorityExtension.fromString(json['priority'] as String),
      submitterName: json['submitter_name'] as String?,
      submitterEmail: json['submitter_email'] as String?,
      referenceLink: json['reference_link'] as String?,
      assignedTo: json['assigned_to'] as String?,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'token': token,
      'title': title,
      'description': description,
      'category_id': categoryId,
      if (categoryName != null) 'category_name': categoryName,
      'status': status.value,
      'priority': priority.value,
      if (submitterName != null) 'submitter_name': submitterName,
      if (submitterEmail != null) 'submitter_email': submitterEmail,
      if (referenceLink != null) 'reference_link': referenceLink,
      if (assignedTo != null) 'assigned_to': assignedTo,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
    };
  }

  @override
  List<Object?> get props =>
      [id, token, title, description, categoryId, status, priority, createdAt];
}

/// Ticket comment model
class TicketComment extends Equatable {
  final int id;
  final int ticketId;
  final String commenterType;
  final String commenterName;
  final String commentText;
  final bool isInternal;
  final String? createdAt;

  const TicketComment({
    required this.id,
    required this.ticketId,
    required this.commenterType,
    required this.commenterName,
    required this.commentText,
    required this.isInternal,
    this.createdAt,
  });

  factory TicketComment.fromJson(Map<String, dynamic> json) {
    return TicketComment(
      id: json['id'] as int,
      ticketId: json['ticket_id'] as int,
      commenterType: json['commenter_type'] as String,
      commenterName: json['commenter_name'] as String,
      commentText: json['comment_text'] as String,
      isInternal: _parseBool(json['is_internal']),
      createdAt: json['created_at'] as String?,
    );
  }

  @override
  List<Object?> get props => [
        id,
        ticketId,
        commenterType,
        commenterName,
        commentText,
        isInternal,
        createdAt
      ];
}

/// Ticket create request
class TicketCreate {
  final String title;
  final String description;
  final int categoryId;
  final TicketPriority? priority;
  final String? submitterName;
  final String? submitterEmail;
  final String? referenceLink;

  const TicketCreate({
    required this.title,
    required this.description,
    required this.categoryId,
    this.priority,
    this.submitterName,
    this.submitterEmail,
    this.referenceLink,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'category_id': categoryId,
      if (priority != null) 'priority': priority!.value,
      if (submitterName != null) 'submitter_name': submitterName,
      if (submitterEmail != null) 'submitter_email': submitterEmail,
      if (referenceLink != null) 'reference_link': referenceLink,
    };
  }
}

/// Ticket update request
class TicketUpdate {
  final String? title;
  final String? description;
  final int? categoryId;
  final TicketPriority? priority;
  final TicketStatus? status;

  const TicketUpdate({
    this.title,
    this.description,
    this.categoryId,
    this.priority,
    this.status,
  });

  Map<String, dynamic> toJson() {
    return {
      if (title != null) 'title': title,
      if (description != null) 'description': description,
      if (categoryId != null) 'category_id': categoryId,
      if (priority != null) 'priority': priority!.value,
      if (status != null) 'status': status!.value,
    };
  }
}

/// Ticket stats model
class TicketStats extends Equatable {
  final int total;
  final int open;
  final int inProgress;
  final int waiting;
  final int solved;

  const TicketStats({
    required this.total,
    required this.open,
    required this.inProgress,
    required this.waiting,
    required this.solved,
  });

  factory TicketStats.fromJson(Map<String, dynamic> json) {
    return TicketStats(
      total: json['total'] as int? ?? 0,
      open: json['open'] as int? ?? 0,
      inProgress: json['in_progress'] as int? ?? 0,
      waiting: json['waiting'] as int? ?? 0,
      solved: json['solved'] as int? ?? 0,
    );
  }

  @override
  List<Object?> get props => [total, open, inProgress, waiting, solved];
}

/// Ticket assignment model
class TicketAssignment extends Equatable {
  final int id;
  final int ticketId;
  final String? assignedFrom;
  final String assignedTo;
  final String assignedBy;
  final String? notes;
  final String? createdAt;

  const TicketAssignment({
    required this.id,
    required this.ticketId,
    this.assignedFrom,
    required this.assignedTo,
    required this.assignedBy,
    this.notes,
    this.createdAt,
  });

  factory TicketAssignment.fromJson(Map<String, dynamic> json) {
    return TicketAssignment(
      id: json['id'] as int,
      ticketId: json['ticket_id'] as int,
      assignedFrom: json['assigned_from'] as String?,
      assignedTo: json['assigned_to'] as String,
      assignedBy: json['assigned_by'] as String,
      notes: json['notes'] as String?,
      createdAt: json['created_at'] as String?,
    );
  }

  @override
  List<Object?> get props =>
      [id, ticketId, assignedFrom, assignedTo, assignedBy, notes, createdAt];
}

/// Ticket assign request
class TicketAssign {
  final String assignedTo;
  final String? notes;

  const TicketAssign({
    required this.assignedTo,
    this.notes,
  });

  Map<String, dynamic> toJson() {
    return {
      'assigned_to': assignedTo,
      if (notes != null) 'notes': notes,
    };
  }
}

/// Helper to parse bool from int (0/1) or bool
bool _parseBool(dynamic value, {bool defaultValue = false}) {
  if (value == null) return defaultValue;
  if (value is bool) return value;
  if (value is int) return value != 0;
  if (value is String) return value.toLowerCase() == 'true' || value == '1';
  return defaultValue;
}
