import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Tickets provider
class TicketsProvider extends ChangeNotifier {
  List<Ticket> _tickets = [];
  List<TicketCategory> _categories = [];
  List<TicketComment> _comments = [];
  TicketStats? _stats;
  Ticket? _selectedTicket;
  bool _isLoading = false;
  String? _error;

  List<Ticket> get tickets => _tickets;
  List<TicketCategory> get categories => _categories;
  List<TicketComment> get comments => _comments;
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
      ]);

      _tickets = results[0] as List<Ticket>;
      _categories = results[1] as List<TicketCategory>;

      _calculateStats(); // Calculate stats locally

      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Parse error: $e';
      _isLoading = false;
      notifyListeners();
    }
  }

  void _calculateStats() {
    int open = 0;
    int inProgress = 0;
    int waiting = 0;
    int solved = 0;

    for (var ticket in _tickets) {
      switch (ticket.status) {
        case TicketStatus.open:
          open++;
          break;
        case TicketStatus.inProgress:
          inProgress++;
          break;
        case TicketStatus.waiting:
          waiting++;
          break;
        case TicketStatus.solved:
          solved++;
          break;
      }
    }

    _stats = TicketStats(
      total: _tickets.length,
      open: open,
      inProgress: inProgress,
      waiting: waiting,
      solved: solved,
    );
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
    } catch (e) {
      _error = 'Parse error: $e';
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
      _calculateStats(); // Recalculate stats
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  /// Update a ticket
  Future<bool> updateTicket(int id, TicketUpdate data) async {
    try {
      final ticket = await ApiService.updateTicket(id, data);
      final index = _tickets.indexWhere((t) => t.id == id);
      if (index != -1) {
        _tickets[index] = ticket;
        _calculateStats(); // Recalculate stats
        notifyListeners();
      }
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

  /// Load ticket comments
  Future<void> loadComments(int ticketId) async {
    _isLoading = true;
    _error = null; // Don't clear main error, maybe? Or yes.
    notifyListeners();

    try {
      _comments = await ApiService.getTicketComments(ticketId);
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Parse error: $e';
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Add a comment
  Future<bool> addComment(int ticketId, String comment) async {
    try {
      final newComment = await ApiService.addTicketComment(ticketId, comment);
      _comments.add(newComment);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }
}
