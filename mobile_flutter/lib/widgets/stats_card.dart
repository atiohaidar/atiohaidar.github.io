import 'package:flutter/material.dart';
import '../config/theme.dart';

/// Stats card for dashboard
class StatsCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final List<Color>? gradientColors;
  final String? subtitle;
  final VoidCallback? onTap;

  const StatsCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    this.gradientColors,
    this.subtitle,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final colors =
        gradientColors ?? [AppColors.gradientBlue, AppColors.gradientCyan];

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark
              ? AppColors.darkSurface
                  .withOpacity(0.75) // Increased opacity for legibility
              : Colors.white.withOpacity(0.9),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark ? AppColors.borderLight : Colors.grey.shade200,
          ),
          boxShadow: [
            BoxShadow(
              color: colors[0].withOpacity(0.1),
              blurRadius: 20,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: colors,
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: colors[0].withOpacity(0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Icon(
                    icon,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
                if (subtitle != null)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: isDark
                          ? colors[0].withOpacity(0.15)
                          : colors[0].withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      subtitle!,
                      style: TextStyle(
                        fontSize: 12,
                        color: colors[0],
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              value,
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: isDark ? AppColors.textPrimary : AppColors.lightText,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: isDark
                    ? AppColors.textSecondary
                    : AppColors.lightTextSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Status badge widget
class StatusBadge extends StatelessWidget {
  final String text;
  final Color color;
  final Color? textColor;

  const StatusBadge({
    super.key,
    required this.text,
    required this.color,
    this.textColor,
  });

  // Factory constructors for common statuses
  factory StatusBadge.pending() => const StatusBadge(
        text: 'Pending',
        color: Color(0xFFFEF3C7),
        textColor: Color(0xFFD97706),
      );

  factory StatusBadge.approved() => const StatusBadge(
        text: 'Approved',
        color: Color(0xFFD1FAE5),
        textColor: Color(0xFF059669),
      );

  factory StatusBadge.rejected() => const StatusBadge(
        text: 'Rejected',
        color: Color(0xFFFEE2E2),
        textColor: Color(0xFFDC2626),
      );

  factory StatusBadge.open() => const StatusBadge(
        text: 'Open',
        color: Color(0xFFDBEAFE),
        textColor: Color(0xFF2563EB),
      );

  factory StatusBadge.inProgress() => const StatusBadge(
        text: 'In Progress',
        color: Color(0xFFFEF3C7),
        textColor: Color(0xFFD97706),
      );

  factory StatusBadge.solved() => const StatusBadge(
        text: 'Solved',
        color: Color(0xFFD1FAE5),
        textColor: Color(0xFF059669),
      );

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: textColor ?? Colors.white,
        ),
      ),
    );
  }
}
