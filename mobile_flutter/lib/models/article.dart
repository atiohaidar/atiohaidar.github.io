import 'package:equatable/equatable.dart';

/// Article model
class Article extends Equatable {
  final String slug;
  final String title;
  final String content;
  final bool published;
  final String? owner;
  final String? createdAt;
  final String? updatedAt;

  const Article({
    required this.slug,
    required this.title,
    required this.content,
    required this.published,
    this.owner,
    this.createdAt,
    this.updatedAt,
  });

  factory Article.fromJson(Map<String, dynamic> json) {
    return Article(
      slug: json['slug'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      published: _parseBool(json['published']),
      owner: json['owner'] as String?,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'slug': slug,
      'title': title,
      'content': content,
      'published': published,
      if (owner != null) 'owner': owner,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
    };
  }

  @override
  List<Object?> get props =>
      [slug, title, content, published, owner, createdAt, updatedAt];
}

/// Article create request
class ArticleCreate {
  final String slug;
  final String title;
  final String content;
  final bool? published;

  const ArticleCreate({
    required this.slug,
    required this.title,
    required this.content,
    this.published,
  });

  Map<String, dynamic> toJson() {
    return {
      'slug': slug,
      'title': title,
      'content': content,
      if (published != null) 'published': published,
    };
  }
}

/// Article update request
class ArticleUpdate {
  final String? title;
  final String? content;
  final bool? published;

  const ArticleUpdate({
    this.title,
    this.content,
    this.published,
  });

  Map<String, dynamic> toJson() {
    return {
      if (title != null) 'title': title,
      if (content != null) 'content': content,
      if (published != null) 'published': published,
    };
  }
}

/// Helper to parse bool from int (0/1) or bool
bool _parseBool(dynamic value, {bool defaultValue = false}) {
  if (value == null) return defaultValue;
  if (value is bool) return value;
  if (value is int) return value != 0;
  if (value is String) return value.toLowerCase() == 'true' || value == '1';
  return defaultValue;
}
