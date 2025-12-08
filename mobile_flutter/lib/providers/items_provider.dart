import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Items provider
class ItemsProvider extends ChangeNotifier {
  List<Item> _items = [];
  List<ItemBorrowing> _borrowings = [];
  bool _isLoading = false;
  String? _error;

  List<Item> get items => _items;
  List<ItemBorrowing> get borrowings => _borrowings;
  List<ItemBorrowing> get pendingBorrowings => _borrowings.where((b) => b.status == ItemBorrowingStatus.pending).toList();
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Load all items
  Future<void> loadItems() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _items = await ApiService.getItems();
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load all borrowings
  Future<void> loadBorrowings() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _borrowings = await ApiService.getItemBorrowings();
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load items and borrowings
  Future<void> loadAll() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        ApiService.getItems(),
        ApiService.getItemBorrowings(),
      ]);

      _items = results[0] as List<Item>;
      _borrowings = results[1] as List<ItemBorrowing>;
      
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Create an item
  Future<bool> createItem(ItemCreate data) async {
    try {
      final item = await ApiService.createItem(data);
      _items.insert(0, item);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  /// Create a borrowing
  Future<bool> createBorrowing(ItemBorrowingCreate data) async {
    try {
      final borrowing = await ApiService.createItemBorrowing(data);
      _borrowings.insert(0, borrowing);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  /// Delete an item
  Future<bool> deleteItem(String id) async {
    try {
      await ApiService.deleteItem(id);
      _items.removeWhere((i) => i.id == id);
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
