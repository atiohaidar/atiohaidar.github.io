import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Forms provider
class FormsProvider extends ChangeNotifier {
  List<FormData> _forms = [];
  FormWithQuestions? _selectedForm;
  List<FormResponse> _responses = [];
  FormResponseDetail? _selectedResponse;
  bool _isLoading = false;
  String? _error;

  List<FormData> get forms => _forms;
  FormWithQuestions? get selectedForm => _selectedForm;
  List<FormResponse> get responses => _responses;
  FormResponseDetail? get selectedResponse => _selectedResponse;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Load all forms
  Future<void> loadForms() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _forms = await ApiService.getForms();
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load form details
  Future<void> loadForm(String id) async {
    _isLoading = true;
    notifyListeners();

    try {
      _selectedForm = await ApiService.getForm(id);
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load form responses
  Future<void> loadFormResponses(String formId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _responses = await ApiService.getFormResponses(formId);
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load single response detail
  Future<void> loadFormResponse(String formId, String responseId) async {
    _isLoading = true;
    notifyListeners();

    try {
      _selectedResponse = await ApiService.getFormResponse(formId, responseId);
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Create a new form
  Future<bool> createForm(FormCreate data) async {
    try {
      final form = await ApiService.createForm(data);
      _forms.insert(0, form);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  /// Delete a form
  Future<bool> deleteForm(String id) async {
    try {
      await ApiService.deleteForm(id);
      _forms.removeWhere((f) => f.id == id);
      if (_selectedForm?.form.id == id) {
        _selectedForm = null;
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

  void clearResponses() {
    _responses = [];
    _selectedResponse = null;
    notifyListeners();
  }
}
