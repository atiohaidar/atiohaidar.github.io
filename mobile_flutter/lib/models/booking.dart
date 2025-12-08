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
  final String? purpose;
  final String? createdAt;
  final String? updatedAt;

  const Booking({
    required this.id,
    required this.roomId,
    required this.userUsername,
    required this.startTime,
    required this.endTime,
    required this.status,
    this.purpose,
    this.createdAt,
    this.updatedAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] as String,
      roomId: json['room_id'] as String,
      userUsername: json['user_username'] as String,
      startTime: json['start_time'] as String,
      endTime: json['end_time'] as String,
      status: BookingStatusExtension.fromString(json['status'] as String),
      purpose: json['purpose'] as String?,
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
      if (purpose != null) 'purpose': purpose,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
    };
  }

  @override
  List<Object?> get props => [id, roomId, userUsername, startTime, endTime, status, purpose, createdAt, updatedAt];
}

/// Booking create request
class BookingCreate {
  final String roomId;
  final String startTime;
  final String endTime;
  final String? purpose;

  const BookingCreate({
    required this.roomId,
    required this.startTime,
    required this.endTime,
    this.purpose,
  });

  Map<String, dynamic> toJson() {
    return {
      'room_id': roomId,
      'start_time': startTime,
      'end_time': endTime,
      if (purpose != null) 'purpose': purpose,
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
