import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Rooms provider
class RoomsProvider extends ChangeNotifier {
  List<Room> _rooms = [];
  List<Booking> _bookings = [];
  Room? _selectedRoom;
  bool _isLoading = false;
  String? _error;

  List<Room> get rooms => _rooms;
  List<Room> get availableRooms => _rooms.where((r) => r.available).toList();
  List<Booking> get bookings => _bookings;
  List<Booking> get pendingBookings =>
      _bookings.where((b) => b.status == BookingStatus.pending).toList();
  Room? get selectedRoom => _selectedRoom;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Load all rooms
  Future<void> loadRooms() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _rooms = await ApiService.getRooms();
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load all bookings
  Future<void> loadBookings() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _bookings = await ApiService.getBookings();
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load rooms and bookings
  Future<void> loadAll() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        ApiService.getRooms(),
        ApiService.getBookings(),
      ]);

      _rooms = results[0] as List<Room>;
      _bookings = results[1] as List<Booking>;

      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load room by ID
  Future<void> loadRoom(String id) async {
    _isLoading = true;
    notifyListeners();

    try {
      _selectedRoom = await ApiService.getRoom(id);
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Create a room
  Future<bool> createRoom(RoomCreate data) async {
    try {
      final room = await ApiService.createRoom(data);
      _rooms.insert(0, room);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  /// Create a booking
  Future<bool> createBooking(BookingCreate data) async {
    try {
      final booking = await ApiService.createBooking(data);
      _bookings.insert(0, booking);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  /// Update booking status
  Future<bool> updateBookingStatus(String id, BookingStatus status) async {
    try {
      final updated = await ApiService.updateBookingStatus(
          id, BookingUpdate(status: status));
      final index = _bookings.indexWhere((b) => b.id == id);
      if (index != -1) {
        _bookings[index] = updated;
        notifyListeners();
      }
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  /// Get bookings for a specific room
  List<Booking> getBookingsForRoom(String roomId) {
    return _bookings.where((b) => b.roomId == roomId).toList();
  }

  /// Cancel a booking
  Future<bool> cancelBooking(String id) async {
    try {
      await ApiService.cancelBooking(id);
      _bookings.removeWhere((b) => b.id == id);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
