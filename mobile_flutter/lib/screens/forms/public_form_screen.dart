import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/services.dart';
import '../../models/models.dart';
import '../../widgets/widgets.dart';

/// Public Form Submission Screen (No Auth Required)
class PublicFormScreen extends StatefulWidget {
  final String token;

  const PublicFormScreen({super.key, required this.token});

  @override
  State<PublicFormScreen> createState() => _PublicFormScreenState();
}

class _PublicFormScreenState extends State<PublicFormScreen> {
  FormWithQuestions? _formData;
  bool _isLoading = true;
  bool _isSubmitting = false;
  bool _submitted = false;
  String? _error;

  final Map<String, String> _answers = {};

  @override
  void initState() {
    super.initState();
    _loadForm();
  }

  Future<void> _loadForm() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final formData = await ApiService.getPublicFormByToken(widget.token);
      setState(() {
        _formData = formData;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _submitForm() async {
    if (_formData == null) return;

    // Validate all questions have answers
    for (final q in _formData!.questions) {
      if (!_answers.containsKey(q.id) || _answers[q.id]!.trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Harap jawab: ${q.questionText}')),
        );
        return;
      }
    }

    setState(() => _isSubmitting = true);

    try {
      await ApiService.submitPublicFormResponse(widget.token, {
        'answers': _answers.entries
            .map((e) => {'question_id': e.key, 'answer_text': e.value})
            .toList(),
      });
      setState(() {
        _isSubmitting = false;
        _submitted = true;
      });
    } catch (e) {
      setState(() => _isSubmitting = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: Text(_formData?.form.title ?? 'Formulir'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: _buildBody(isDark),
    );
  }

  Widget _buildBody(bool isDark) {
    if (_isLoading) {
      return const LoadingIndicator(message: 'Memuat formulir...');
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppColors.error),
              const SizedBox(height: 16),
              Text(
                'Formulir tidak ditemukan',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppColors.textPrimary : AppColors.lightText,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Formulir ini mungkin telah kedaluwarsa atau tidak ada.',
                style: TextStyle(
                  color: isDark
                      ? AppColors.textSecondary
                      : AppColors.lightTextSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    if (_submitted) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: GlassCard(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle,
                    size: 72, color: AppColors.success),
                const SizedBox(height: 24),
                Text(
                  'Terima kasih!',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.textPrimary : AppColors.lightText,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Respon Anda telah dikirim.',
                  style: TextStyle(
                    color: isDark
                        ? AppColors.textSecondary
                        : AppColors.lightTextSecondary,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (_formData!.form.description != null &&
            _formData!.form.description!.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Text(
              _formData!.form.description!,
              style: TextStyle(
                color: isDark
                    ? AppColors.textSecondary
                    : AppColors.lightTextSecondary,
              ),
            ),
          ),
        ..._formData!.questions.map((q) => _buildQuestionCard(q, isDark)),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: _isSubmitting ? null : _submitForm,
          child: _isSubmitting
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : const Text('Kirim'),
        ),
      ],
    );
  }

  Widget _buildQuestionCard(FormQuestion q, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: GlassCard(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    q.questionText,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color:
                          isDark ? AppColors.textPrimary : AppColors.lightText,
                    ),
                  ),
                ),
                const Text(' *', style: TextStyle(color: AppColors.error)),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              decoration: const InputDecoration(hintText: 'Jawaban Anda'),
              onChanged: (v) => setState(() => _answers[q.id] = v),
            ),
          ],
        ),
      ),
    );
  }
}
