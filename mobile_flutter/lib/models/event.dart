import 'package:equatable/equatable.dart';

/// Attendee status enum
enum AttendeeStatus { registered, present, absent }

extension AttendeeStatusExtension on AttendeeStatus {
  String get value {
    switch (this) {
      case AttendeeStatus.registered:
        return 'registered';
      case AttendeeStatus.present:
        return 'present';
      case AttendeeStatus.absent:
        return 'absent';
    }
  }

  static AttendeeStatus fromString(String value) {
    switch (value) {
      case 'present':
        return AttendeeStatus.present;
      case 'absent':
        return AttendeeStatus.absent;
      default:
        return AttendeeStatus.registered;
    }
  }
}

/// Event model
class Event extends Equatable {
  final String id;
  final String title;
  final String? description;
  final String eventDate;
  final String? location;
  final String createdBy;
  final String? createdAt;
  final String? updatedAt;

  const Event({
    required this.id,
    required this.title,
    this.description,
    required this.eventDate,
    this.location,
    required this.createdBy,
    this.createdAt,
    this.updatedAt,
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      eventDate: json['event_date'] as String,
      location: json['location'] as String?,
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
      'event_date': eventDate,
      if (location != null) 'location': location,
      'created_by': createdBy,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
    };
  }

  bool get isUpcoming => DateTime.parse(eventDate).isAfter(DateTime.now());

  @override
  List<Object?> get props => [id, title, description, eventDate, location, createdBy, createdAt, updatedAt];
}

/// Event create request
class EventCreate {
  final String title;
  final String? description;
  final String eventDate;
  final String? location;

  const EventCreate({
    required this.title,
    this.description,
    required this.eventDate,
    this.location,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      if (description != null) 'description': description,
      'event_date': eventDate,
      if (location != null) 'location': location,
    };
  }
}

/// Event update request
class EventUpdate {
  final String? title;
  final String? description;
  final String? eventDate;
  final String? location;

  const EventUpdate({
    this.title,
    this.description,
    this.eventDate,
    this.location,
  });

  Map<String, dynamic> toJson() {
    return {
      if (title != null) 'title': title,
      if (description != null) 'description': description,
      if (eventDate != null) 'event_date': eventDate,
      if (location != null) 'location': location,
    };
  }
}

/// Event attendee model
class EventAttendee extends Equatable {
  final String id;
  final String eventId;
  final String userUsername;
  final String attendanceToken;
  final AttendeeStatus status;
  final String? registeredAt;

  const EventAttendee({
    required this.id,
    required this.eventId,
    required this.userUsername,
    required this.attendanceToken,
    required this.status,
    this.registeredAt,
  });

  factory EventAttendee.fromJson(Map<String, dynamic> json) {
    return EventAttendee(
      id: json['id'] as String,
      eventId: json['event_id'] as String,
      userUsername: json['user_username'] as String,
      attendanceToken: json['attendance_token'] as String,
      status: AttendeeStatusExtension.fromString(json['status'] as String),
      registeredAt: json['registered_at'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, eventId, userUsername, attendanceToken, status, registeredAt];
}

/// Event admin model
class EventAdmin extends Equatable {
  final String id;
  final String eventId;
  final String userUsername;
  final String assignedBy;
  final String? assignedAt;

  const EventAdmin({
    required this.id,
    required this.eventId,
    required this.userUsername,
    required this.assignedBy,
    this.assignedAt,
  });

  factory EventAdmin.fromJson(Map<String, dynamic> json) {
    return EventAdmin(
      id: json['id'] as String,
      eventId: json['event_id'] as String,
      userUsername: json['user_username'] as String,
      assignedBy: json['assigned_by'] as String,
      assignedAt: json['assigned_at'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, eventId, userUsername, assignedBy, assignedAt];
}

/// Attendance scan model
class AttendanceScan extends Equatable {
  final String id;
  final String attendeeId;
  final String scannedBy;
  final String? scannedAt;
  final double? latitude;
  final double? longitude;

  const AttendanceScan({
    required this.id,
    required this.attendeeId,
    required this.scannedBy,
    this.scannedAt,
    this.latitude,
    this.longitude,
  });

  factory AttendanceScan.fromJson(Map<String, dynamic> json) {
    return AttendanceScan(
      id: json['id'] as String,
      attendeeId: json['attendee_id'] as String,
      scannedBy: json['scanned_by'] as String,
      scannedAt: json['scanned_at'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );
  }

  @override
  List<Object?> get props => [id, attendeeId, scannedBy, scannedAt, latitude, longitude];
}
