import 'package:equatable/equatable.dart';

/// Room model
class Room extends Equatable {
  final String id;
  final String name;
  final int capacity;
  final String? description;
  final bool available;
  final String? createdAt;
  final String? updatedAt;

  const Room({
    required this.id,
    required this.name,
    required this.capacity,
    this.description,
    required this.available,
    this.createdAt,
    this.updatedAt,
  });

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json['id'] as String,
      name: json['name'] as String,
      capacity: json['capacity'] as int,
      description: json['description'] as String?,
      available: _parseBool(json['available'], defaultValue: true),
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'capacity': capacity,
      if (description != null) 'description': description,
      'available': available,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
    };
  }

  @override
  List<Object?> get props =>
      [id, name, capacity, description, available, createdAt, updatedAt];
}

/// Room create request
class RoomCreate {
  final String id;
  final String name;
  final int capacity;
  final String? description;
  final bool? available;

  const RoomCreate({
    required this.id,
    required this.name,
    required this.capacity,
    this.description,
    this.available,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'capacity': capacity,
      if (description != null) 'description': description,
      if (available != null) 'available': available,
    };
  }
}

/// Room update request
class RoomUpdate {
  final String? name;
  final int? capacity;
  final String? description;
  final bool? available;

  const RoomUpdate({
    this.name,
    this.capacity,
    this.description,
    this.available,
  });

  Map<String, dynamic> toJson() {
    return {
      if (name != null) 'name': name,
      if (capacity != null) 'capacity': capacity,
      if (description != null) 'description': description,
      if (available != null) 'available': available,
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
