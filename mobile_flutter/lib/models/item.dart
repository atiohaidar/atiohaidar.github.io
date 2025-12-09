import 'package:equatable/equatable.dart';

/// Item model
class Item extends Equatable {
  final String id;
  final String name;
  final String? description;
  final int stock;
  final String? attachmentLink;
  final String ownerUsername;
  final String? createdAt;
  final String? updatedAt;

  const Item({
    required this.id,
    required this.name,
    this.description,
    required this.stock,
    this.attachmentLink,
    required this.ownerUsername,
    this.createdAt,
    this.updatedAt,
  });

  factory Item.fromJson(Map<String, dynamic> json) {
    return Item(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      stock: json['stock'] as int,
      attachmentLink: json['attachment_link'] as String?,
      ownerUsername: json['owner_username'] as String,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      if (description != null) 'description': description,
      'stock': stock,
      if (attachmentLink != null) 'attachment_link': attachmentLink,
      'owner_username': ownerUsername,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
    };
  }

  @override
  List<Object?> get props => [
        id,
        name,
        description,
        stock,
        attachmentLink,
        ownerUsername,
        createdAt,
        updatedAt
      ];
}

/// Item borrowing status enum
enum ItemBorrowingStatus {
  pending,
  approved,
  rejected,
  returned,
  damaged,
  extended
}

extension ItemBorrowingStatusExtension on ItemBorrowingStatus {
  String get value {
    switch (this) {
      case ItemBorrowingStatus.pending:
        return 'pending';
      case ItemBorrowingStatus.approved:
        return 'approved';
      case ItemBorrowingStatus.rejected:
        return 'rejected';
      case ItemBorrowingStatus.returned:
        return 'returned';
      case ItemBorrowingStatus.damaged:
        return 'damaged';
      case ItemBorrowingStatus.extended:
        return 'extended';
    }
  }

  static ItemBorrowingStatus fromString(String value) {
    switch (value) {
      case 'approved':
        return ItemBorrowingStatus.approved;
      case 'rejected':
        return ItemBorrowingStatus.rejected;
      case 'returned':
        return ItemBorrowingStatus.returned;
      case 'damaged':
        return ItemBorrowingStatus.damaged;
      case 'extended':
        return ItemBorrowingStatus.extended;
      default:
        return ItemBorrowingStatus.pending;
    }
  }
}

/// Item borrowing model
class ItemBorrowing extends Equatable {
  final String id;
  final String itemId;
  final String borrowerUsername;
  final int quantity;
  final String startDate;
  final String endDate;
  final ItemBorrowingStatus status;
  final String? notes;
  final String? createdAt;
  final String? updatedAt;

  const ItemBorrowing({
    required this.id,
    required this.itemId,
    required this.borrowerUsername,
    required this.quantity,
    required this.startDate,
    required this.endDate,
    required this.status,
    this.notes,
    this.createdAt,
    this.updatedAt,
  });

  factory ItemBorrowing.fromJson(Map<String, dynamic> json) {
    return ItemBorrowing(
      id: json['id'] as String,
      itemId: json['item_id'] as String,
      borrowerUsername: json['borrower_username'] as String,
      quantity: json['quantity'] as int,
      startDate: json['start_date'] as String,
      endDate: json['end_date'] as String,
      status: ItemBorrowingStatusExtension.fromString(json['status'] as String),
      notes: json['notes'] as String?,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'item_id': itemId,
      'borrower_username': borrowerUsername,
      'quantity': quantity,
      'start_date': startDate,
      'end_date': endDate,
      'status': status.value,
      if (notes != null) 'notes': notes,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
    };
  }

  @override
  List<Object?> get props => [
        id,
        itemId,
        borrowerUsername,
        quantity,
        startDate,
        endDate,
        status,
        notes,
        createdAt,
        updatedAt
      ];
}

/// Item create request
class ItemCreate {
  final String name;
  final String? description;
  final int stock;
  final String? attachmentLink;

  const ItemCreate({
    required this.name,
    this.description,
    required this.stock,
    this.attachmentLink,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      if (description != null) 'description': description,
      'stock': stock,
      if (attachmentLink != null) 'attachment_link': attachmentLink,
    };
  }
}

/// Item borrowing create request
class ItemBorrowingCreate {
  final String itemId;
  final int quantity;
  final String startDate;
  final String endDate;
  final String? notes;

  const ItemBorrowingCreate({
    required this.itemId,
    required this.quantity,
    required this.startDate,
    required this.endDate,
    this.notes,
  });

  Map<String, dynamic> toJson() {
    return {
      'item_id': itemId,
      'quantity': quantity,
      'start_date': startDate,
      'end_date': endDate,
      if (notes != null) 'notes': notes,
    };
  }
}

/// Item update request
class ItemUpdate {
  final String? name;
  final String? description;
  final int? stock;
  final String? attachmentLink;

  const ItemUpdate({
    this.name,
    this.description,
    this.stock,
    this.attachmentLink,
  });

  Map<String, dynamic> toJson() {
    return {
      if (name != null) 'name': name,
      if (description != null) 'description': description,
      if (stock != null) 'stock': stock,
      if (attachmentLink != null) 'attachment_link': attachmentLink,
    };
  }
}
