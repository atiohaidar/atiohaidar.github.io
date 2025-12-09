import 'package:equatable/equatable.dart';

/// Booking status enum
enum BookingStatus { pending, approved, rejected, cancelled }

extension BookingStatusExtension on BookingStatus {
  String get value {
    switch (this) {
      case BookingStatus.pending:
        return 'pending';
      case BookingStatus.approved:
        return 'approved';
      case BookingStatus.rejected:
        return 'rejected';
      case BookingStatus.cancelled:
        return 'cancelled';
    }
  }

  static BookingStatus fromString(String value) {
    switch (value) {
      case 'approved':
        return BookingStatus.approved;
      case 'rejected':
        return BookingStatus.rejected;
      case 'cancelled':
        return BookingStatus.cancelled;
      default:
        return BookingStatus.pending;
    }
  }
}

/// Booking model
class Booking extends Equatable {
  final String id;
  final String roomId;
  final String userUsername;
  final String startTime;
  final String endTime;
  final BookingStatus status;
  final String? title;
  final String? description;
  final String? createdAt;
  final String? updatedAt;

  const Booking({
    required this.id,
    required this.roomId,
    required this.userUsername,
    required this.startTime,
    required this.endTime,
    required this.status,
    this.title,
    this.description,
    this.createdAt,
    this.updatedAt,
  });

  // Backwards compatible getter for old code using 'purpose'
  String? get purpose => title ?? description;

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] as String,
      roomId: json['room_id'] as String,
      userUsername: json['user_username'] as String,
      startTime: json['start_time'] as String,
      endTime: json['end_time'] as String,
      status: BookingStatusExtension.fromString(json['status'] as String),
      title: json['title'] as String?,
      description: json['description'] as String?,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'room_id': roomId,
      'user_username': userUsername,
      'start_time': startTime,
      'end_time': endTime,
      'status': status.value,
      if (title != null) 'title': title,
      if (description != null) 'description': description,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
    };
  }

  @override
  List<Object?> get props => [
        id,
        roomId,
        userUsername,
        startTime,
        endTime,
        status,
        title,
        description,
        createdAt,
        updatedAt
      ];
}

/// Booking create request
class BookingCreate {
  final String roomId;
  final String startTime;
  final String endTime;
  final String title;
  final String? description;

  const BookingCreate({
    required this.roomId,
    required this.startTime,
    required this.endTime,
    required this.title,
    this.description,
  });

  Map<String, dynamic> toJson() {
    return {
      'room_id': roomId,
      'start_time': startTime,
      'end_time': endTime,
      'title': title,
      if (description != null) 'description': description,
    };
  }
}

/// Booking update request
class BookingUpdate {
  final BookingStatus status;

  const BookingUpdate({required this.status});

  Map<String, dynamic> toJson() {
    return {
      'status': status.value,
    };
  }
}
