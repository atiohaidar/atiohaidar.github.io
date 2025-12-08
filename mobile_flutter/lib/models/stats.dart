import 'package:equatable/equatable.dart';

/// Dashboard stats model
class DashboardStats extends Equatable {
  final int? totalUsers;
  final int totalTasks;
  final int completedTasks;
  final int totalArticles;
  final int publishedArticles;
  final int? totalRooms;
  final int totalBookings;
  final int pendingBookings;
  final int approvedBookings;

  const DashboardStats({
    this.totalUsers,
    required this.totalTasks,
    required this.completedTasks,
    required this.totalArticles,
    required this.publishedArticles,
    this.totalRooms,
    required this.totalBookings,
    required this.pendingBookings,
    required this.approvedBookings,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalUsers: json['totalUsers'] as int?,
      totalTasks: json['totalTasks'] as int? ?? 0,
      completedTasks: json['completedTasks'] as int? ?? 0,
      totalArticles: json['totalArticles'] as int? ?? 0,
      publishedArticles: json['publishedArticles'] as int? ?? 0,
      totalRooms: json['totalRooms'] as int?,
      totalBookings: json['totalBookings'] as int? ?? 0,
      pendingBookings: json['pendingBookings'] as int? ?? 0,
      approvedBookings: json['approvedBookings'] as int? ?? 0,
    );
  }

  @override
  List<Object?> get props => [
        totalUsers,
        totalTasks,
        completedTasks,
        totalArticles,
        publishedArticles,
        totalRooms,
        totalBookings,
        pendingBookings,
        approvedBookings,
      ];
}
