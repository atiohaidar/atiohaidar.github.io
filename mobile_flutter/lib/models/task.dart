import 'package:equatable/equatable.dart';

/// Task model
class Task extends Equatable {
  final int id;
  final String name;
  final String? description;
  final bool completed;
  final String? dueDate;
  final String? owner;
  final String? createdAt;
  final String? updatedAt;

  const Task({
    required this.id,
    required this.name,
    this.description,
    required this.completed,
    this.dueDate,
    this.owner,
    this.createdAt,
    this.updatedAt,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'] as int,
      name: json['name'] as String,
      description: json['description'] as String?,
      completed: _parseBool(json['completed']),
      dueDate: json['due_date'] as String?,
      owner: json['owner'] as String?,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      if (description != null) 'description': description,
      'completed': completed,
      if (dueDate != null) 'due_date': dueDate,
      if (owner != null) 'owner': owner,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
    };
  }

  Task copyWith({
    int? id,
    String? name,
    String? description,
    bool? completed,
    String? dueDate,
    String? owner,
    String? createdAt,
    String? updatedAt,
  }) {
    return Task(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      completed: completed ?? this.completed,
      dueDate: dueDate ?? this.dueDate,
      owner: owner ?? this.owner,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props =>
      [id, name, description, completed, dueDate, owner, createdAt, updatedAt];
}

/// Task create request
class TaskCreate {
  final String name;
  final String? description;
  final bool? completed;
  final String? dueDate;

  const TaskCreate({
    required this.name,
    this.description,
    this.completed,
    this.dueDate,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      if (description != null) 'description': description,
      if (completed != null) 'completed': completed,
      if (dueDate != null) 'due_date': dueDate,
    };
  }
}

/// Task update request
class TaskUpdate {
  final String? name;
  final String? description;
  final bool? completed;
  final String? dueDate;

  const TaskUpdate({
    this.name,
    this.description,
    this.completed,
    this.dueDate,
  });

  Map<String, dynamic> toJson() {
    return {
      if (name != null) 'name': name,
      if (description != null) 'description': description,
      if (completed != null) 'completed': completed,
      if (dueDate != null) 'due_date': dueDate,
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
