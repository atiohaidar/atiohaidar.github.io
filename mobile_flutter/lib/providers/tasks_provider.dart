import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Tasks provider
class TasksProvider extends ChangeNotifier {
  List<Task> _tasks = [];
  bool _isLoading = false;
  String? _error;

  List<Task> get tasks => _tasks;
  List<Task> get pendingTasks => _tasks.where((t) => !t.completed).toList();
  List<Task> get completedTasks => _tasks.where((t) => t.completed).toList();
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Load all tasks
  Future<void> loadTasks() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _tasks = await ApiService.getTasks();
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Create a new task
  Future<bool> createTask(TaskCreate data) async {
    try {
      final task = await ApiService.createTask(data);
      _tasks.insert(0, task);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  /// Update a task
  Future<bool> updateTask(int id, TaskUpdate data) async {
    try {
      final updatedTask = await ApiService.updateTask(id, data);
      final index = _tasks.indexWhere((t) => t.id == id);
      if (index != -1) {
        _tasks[index] = updatedTask;
        notifyListeners();
      }
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  /// Toggle task completion
  Future<bool> toggleTaskCompletion(Task task) async {
    return await updateTask(task.id, TaskUpdate(completed: !task.completed));
  }

  /// Delete a task
  Future<bool> deleteTask(int id) async {
    try {
      await ApiService.deleteTask(id);
      _tasks.removeWhere((t) => t.id == id);
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
