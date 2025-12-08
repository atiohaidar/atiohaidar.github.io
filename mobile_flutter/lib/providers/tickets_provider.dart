import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Tickets provider
class TicketsProvider extends ChangeNotifier {
  List<Ticket> _tickets = [];
  List<TicketCategory> _categories = [];
  TicketStats? _stats;
  Ticket? _selectedTicket;
  bool _isLoading = false;
  String? _error;

  List<Ticket> get tickets => _tickets;
  List<TicketCategory> get categories => _categories;
  TicketStats? get stats => _stats;
  Ticket? get selectedTicket => _selectedTicket;
  bool get isLoading => _isLoading;
  String? get error => _error;

  List<Ticket> get openTickets =>
      _tickets.where((t) => t.status == TicketStatus.open).toList();
  List<Ticket> get inProgressTickets =>
      _tickets.where((t) => t.status == TicketStatus.inProgress).toList();
  List<Ticket> get solvedTickets =>
      _tickets.where((t) => t.status == TicketStatus.solved).toList();

  /// Load all tickets
  Future<void> loadTickets() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        ApiService.getTickets(),
        ApiService.getTicketCategories(),
        ApiService.getTicketStats(),
      ]);

      _tickets = results[0] as List<Ticket>;
      _categories = results[1] as List<TicketCategory>;
      _stats = results[2] as TicketStats;

      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load ticket by ID
  Future<void> loadTicket(int id) async {
    _isLoading = true;
    notifyListeners();

    try {
      _selectedTicket = await ApiService.getTicket(id);
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Filter tickets by status
  List<Ticket> filterByStatus(TicketStatus? status) {
    if (status == null) return _tickets;
    return _tickets.where((t) => t.status == status).toList();
  }

  /// Create a new ticket
  Future<bool> createTicket(TicketCreate data) async {
    try {
      final ticket = await ApiService.createTicket(data);
      _tickets.insert(0, ticket);
      // Update stats locally or reload? For MVP reload is safer but let's just increment total/open
      if (_stats != null) {
        _stats = TicketStats(
          total: _stats!.total + 1,
          open: _stats!.open + 1,
          inProgress: _stats!.inProgress,
          waiting: _stats!.waiting,
          solved: _stats!.solved,
        );
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
