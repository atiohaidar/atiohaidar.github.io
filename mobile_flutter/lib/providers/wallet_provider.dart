import 'package:flutter/foundation.dart';
import '../models/transaction.dart';
import '../services/api_service.dart';

/// Wallet state for managing financial operations
class WalletProvider extends ChangeNotifier {
  List<Transaction> _transactions = [];
  bool _isLoading = false;
  String? _error;
  TransactionType? _filterType;

  List<Transaction> get transactions => _filterType == null
      ? _transactions
      : _transactions.where((t) => t.type == _filterType).toList();

  bool get isLoading => _isLoading;
  String? get error => _error;
  TransactionType? get filterType => _filterType;

  /// Load transactions for the current user
  Future<void> loadTransactions() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _transactions = await ApiService.getTransactions();
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Set filter by transaction type
  void setFilter(TransactionType? type) {
    _filterType = type;
    notifyListeners();
  }

  /// Clear filter
  void clearFilter() {
    _filterType = null;
    notifyListeners();
  }

  /// Refresh transactions list
  Future<void> refresh() async {
    await loadTransactions();
  }

  /// Get summary statistics
  Map<String, double> getSummary(String currentUsername) {
    double totalIncome = 0;
    double totalOutcome = 0;
    double totalTopUp = 0;

    for (final transaction in _transactions) {
      if (transaction.type == TransactionType.topup) {
        if (transaction.toUsername == currentUsername) {
          totalTopUp += transaction.amount;
        }
      } else if (transaction.isIncome(currentUsername)) {
        totalIncome += transaction.amount;
      } else {
        totalOutcome += transaction.amount;
      }
    }

    return {
      'income': totalIncome,
      'outcome': totalOutcome,
      'topup': totalTopUp,
    };
  }
}
