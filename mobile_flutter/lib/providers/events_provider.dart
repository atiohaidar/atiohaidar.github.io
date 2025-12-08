import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Events provider
class EventsProvider extends ChangeNotifier {
  List<Event> _events = [];
  Event? _selectedEvent;
  List<EventAttendee> _attendees = [];
  bool _isLoading = false;
  String? _error;

  List<Event> get events => _events;
  List<Event> get upcomingEvents => _events.where((e) => e.isUpcoming).toList();
  List<Event> get pastEvents => _events.where((e) => !e.isUpcoming).toList();
  Event? get selectedEvent => _selectedEvent;
  List<EventAttendee> get attendees => _attendees;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Load all events
  Future<void> loadEvents() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _events = await ApiService.getEvents();
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load event by ID
  Future<void> loadEvent(String id) async {
    _isLoading = true;
    notifyListeners();

    try {
      _selectedEvent = await ApiService.getEvent(id);
      _attendees = await ApiService.getEventAttendees(id);
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Create a new event
  Future<bool> createEvent(EventCreate data) async {
    try {
      final event = await ApiService.createEvent(data);
      _events.insert(0, event);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  /// Update an event
  Future<bool> updateEvent(String id, EventUpdate data) async {
    try {
      final updatedEvent = await ApiService.updateEvent(id, data);
      final index = _events.indexWhere((e) => e.id == id);
      if (index != -1) {
        _events[index] = updatedEvent;
        notifyListeners();
      }
      if (_selectedEvent?.id == id) {
        _selectedEvent = updatedEvent;
        notifyListeners();
      }
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  /// Delete an event
  Future<bool> deleteEvent(String id) async {
    try {
      await ApiService.deleteEvent(id);
      _events.removeWhere((e) => e.id == id);
      if (_selectedEvent?.id == id) {
        _selectedEvent = null;
      }
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
