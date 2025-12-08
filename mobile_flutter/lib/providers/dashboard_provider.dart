import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Dashboard provider for overview data
class DashboardProvider extends ChangeNotifier {
  DashboardStats? _stats;
  List<Ticket> _recentTickets = [];
  List<Event> _upcomingEvents = [];
  bool _isLoading = false;
  String? _error;

  DashboardStats? get stats => _stats;
  List<Ticket> get recentTickets => _recentTickets;
  List<Event> get upcomingEvents => _upcomingEvents;
  bool get isLoading => _isLoading;
  String? get error => _error;

  int get activeTicketsCount => _recentTickets.where((t) => t.status != TicketStatus.solved).length;
  int get upcomingEventsCount => _upcomingEvents.where((e) => e.isUpcoming).length;

  /// Load all dashboard data
  Future<void> loadDashboardData() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Load all data in parallel
      final results = await Future.wait([
        ApiService.getStats(),
        ApiService.getTickets(),
        ApiService.getEvents(),
      ]);

      _stats = results[0] as DashboardStats;
      _recentTickets = (results[1] as List<Ticket>).take(5).toList();
      _upcomingEvents = (results[2] as List<Event>)
          .where((e) => e.isUpcoming)
          .take(5)
          .toList();
      
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load dashboard data';
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Refresh dashboard data
  Future<void> refresh() async {
    await loadDashboardData();
  }
}
