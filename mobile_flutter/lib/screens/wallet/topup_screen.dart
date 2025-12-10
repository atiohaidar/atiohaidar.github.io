import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../services/api_service.dart';

/// Top Up Screen - Allows admin users to top up any user's balance
class TopUpScreen extends StatefulWidget {
  const TopUpScreen({super.key});

  @override
  State<TopUpScreen> createState() => _TopUpScreenState();
}

class _TopUpScreenState extends State<TopUpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  bool _isLoading = false;
  bool _topUpSelf = true;

  final List<int> _quickAmounts = [50000, 100000, 200000, 500000, 1000000];

  @override
  void dispose() {
    _usernameController.dispose();
    _amountController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final authProvider = context.read<AuthProvider>();
      final targetUsername = _topUpSelf
          ? authProvider.user?.username ?? ''
          : _usernameController.text;

      final amount = double.parse(_amountController.text);
      await ApiService.topUpBalance(
        targetUsername: targetUsername,
        amount: amount,
        description: _descriptionController.text.isEmpty
            ? null
            : _descriptionController.text,
      );

      if (mounted) {
        context.read<AuthProvider>().checkAuth(); // Refresh user balance
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Top up Rp ${amount.toStringAsFixed(0)} berhasil!'),
            backgroundColor: Colors.green,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _setQuickAmount(int amount) {
    _amountController.text = amount.toString();
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final isAdmin = user?.isAdmin ?? false;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Top Up Balance'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      extendBodyBehindAppBar: true,
      body: GradientBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Current Balance Card
                  GlassCard(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Colors.green, Colors.teal],
                            ),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Icon(
                            Icons.account_balance_wallet,
                            color: Colors.white,
                            size: 40,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Current Balance',
                          style: TextStyle(
                            fontSize: 14,
                            color: isDark
                                ? AppColors.textSecondary
                                : AppColors.lightTextSecondary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Rp ${(user?.balance ?? 0).toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}',
                          style: TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            color: isDark
                                ? AppColors.textPrimary
                                : AppColors.lightText,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Admin can top up other users
                  if (isAdmin) ...[
                    GlassCard(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Top Up Target',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: isDark
                                  ? AppColors.textPrimary
                                  : AppColors.lightText,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: _buildOptionChip(
                                  label: 'My Account',
                                  isSelected: _topUpSelf,
                                  onTap: () =>
                                      setState(() => _topUpSelf = true),
                                  isDark: isDark,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildOptionChip(
                                  label: 'Other User',
                                  isSelected: !_topUpSelf,
                                  onTap: () =>
                                      setState(() => _topUpSelf = false),
                                  isDark: isDark,
                                ),
                              ),
                            ],
                          ),
                          if (!_topUpSelf) ...[
                            const SizedBox(height: 16),
                            TextFormField(
                              controller: _usernameController,
                              decoration: const InputDecoration(
                                labelText: 'Target Username',
                                prefixIcon: Icon(Icons.person_outline),
                              ),
                              validator: (value) {
                                if (!_topUpSelf &&
                                    (value == null || value.isEmpty)) {
                                  return 'Please enter username';
                                }
                                return null;
                              },
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Quick Amount Selection
                  Text(
                    'Quick Amount',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color:
                          isDark ? AppColors.textPrimary : AppColors.lightText,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _quickAmounts.map((amount) {
                      final isSelected =
                          _amountController.text == amount.toString();
                      return GestureDetector(
                        onTap: () => _setQuickAmount(amount),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 10,
                          ),
                          decoration: BoxDecoration(
                            gradient: isSelected
                                ? const LinearGradient(
                                    colors: [Colors.green, Colors.teal],
                                  )
                                : null,
                            color: isSelected
                                ? null
                                : (isDark
                                    ? AppColors.darkSurface
                                    : Colors.grey.shade200),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSelected
                                  ? Colors.transparent
                                  : (isDark
                                      ? AppColors.borderLight
                                      : Colors.grey.shade300),
                            ),
                          ),
                          child: Text(
                            'Rp ${(amount / 1000).toInt()}K',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: isSelected
                                  ? Colors.white
                                  : (isDark
                                      ? AppColors.textSecondary
                                      : AppColors.lightTextSecondary),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),

                  // Amount Input
                  TextFormField(
                    controller: _amountController,
                    decoration: const InputDecoration(
                      labelText: 'Amount',
                      prefixIcon: Icon(Icons.attach_money),
                      hintText: 'Enter custom amount',
                    ),
                    keyboardType: TextInputType.number,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter amount';
                      }
                      final amount = double.tryParse(value);
                      if (amount == null || amount <= 0) {
                        return 'Invalid amount';
                      }
                      if (amount < 10000) {
                        return 'Minimum top up is Rp 10,000';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // Description Input
                  TextFormField(
                    controller: _descriptionController,
                    decoration: const InputDecoration(
                      labelText: 'Description (Optional)',
                      prefixIcon: Icon(Icons.note_outlined),
                    ),
                    maxLines: 2,
                  ),
                  const SizedBox(height: 32),

                  // Submit Button
                  ElevatedButton(
                    onPressed: _isLoading ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: Colors.green,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Icon(Icons.add_circle_outline,
                                  color: Colors.white),
                              SizedBox(width: 8),
                              Text(
                                'Top Up Now',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildOptionChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
    required bool isDark,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          gradient: isSelected
              ? const LinearGradient(
                  colors: [AppColors.primaryBlue, AppColors.accentCyan],
                )
              : null,
          color: isSelected
              ? null
              : (isDark ? AppColors.darkSurface : Colors.grey.shade200),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? Colors.transparent
                : (isDark ? AppColors.borderLight : Colors.grey.shade300),
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: isSelected
                  ? Colors.white
                  : (isDark
                      ? AppColors.textSecondary
                      : AppColors.lightTextSecondary),
            ),
          ),
        ),
      ),
    );
  }
}
