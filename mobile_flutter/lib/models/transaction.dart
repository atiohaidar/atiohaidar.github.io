import 'package:equatable/equatable.dart';

/// Transaction type enum
enum TransactionType { transfer, topup }

/// Transaction model
class Transaction extends Equatable {
  final int id;
  final String? fromUsername;
  final String toUsername;
  final double amount;
  final TransactionType type;
  final String? description;
  final DateTime createdAt;

  const Transaction({
    required this.id,
    this.fromUsername,
    required this.toUsername,
    required this.amount,
    required this.type,
    this.description,
    required this.createdAt,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'] as int,
      fromUsername: json['from_username'] as String?,
      toUsername: json['to_username'] as String,
      amount: (json['amount'] as num).toDouble(),
      type: json['type'] == 'topup'
          ? TransactionType.topup
          : TransactionType.transfer,
      description: json['description'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'from_username': fromUsername,
      'to_username': toUsername,
      'amount': amount,
      'type': type == TransactionType.topup ? 'topup' : 'transfer',
      'description': description,
      'created_at': createdAt.toIso8601String(),
    };
  }

  /// Check if this transaction is income for a specific username
  bool isIncome(String username) {
    return toUsername == username;
  }

  /// Get formatted amount with sign based on user context
  String getFormattedAmount(String currentUsername) {
    final isIncoming = isIncome(currentUsername);
    final sign = isIncoming ? '+' : '-';
    return '$sign Rp ${amount.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}';
  }

  /// Get the other party username based on current user
  String getOtherParty(String currentUsername) {
    if (type == TransactionType.topup) {
      return 'Top Up';
    }
    return isIncome(currentUsername) ? (fromUsername ?? 'Unknown') : toUsername;
  }

  @override
  List<Object?> get props =>
      [id, fromUsername, toUsername, amount, type, description, createdAt];
}
