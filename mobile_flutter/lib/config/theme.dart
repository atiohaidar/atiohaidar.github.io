import 'package:flutter/material.dart';

/// App color palette matching frontend's Modern Dark Glass aesthetic
class AppColors {
  // Primary colors
  static const Color deepNavy = Color(0xFF0D1117);
  static const Color darkSurface = Color(0xFF1A2230);
  static const Color cardBackground = Color(0xB31A2230); // 70% opacity

  // Accent colors
  static const Color primaryBlue = Color(0xFF3B82F6);
  static const Color accentCyan = Color(0xFF22D3EE);
  static const Color accentIndigo = Color(0xFF6366F1);
  static const Color purple = Color(0xFF8B5CF6); // Added for admin badge

  // Gradient colors
  static const Color gradientBlue = Color(0xFF3B82F6);
  static const Color gradientCyan = Color(0xFF06B6D4);
  static const Color gradientIndigo = Color(0xFF6366F1);

  // Status colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // Text colors
  static const Color textPrimary = Colors.white;
  static const Color textSecondary =
      Color(0xFFCBD5E1); // Lighter for better readability (Slate-300)
  static const Color textMuted = Color(0xFF94A3B8); // Lighter muted (Slate-400)

  // Border colors
  static const Color borderLight =
      Color(0x33FFFFFF); // 20% white for better card definition
  static const Color borderMedium = Color(0x4DFFFFFF); // 30% white

  // Light theme colors
  static const Color lightBackground = Color(0xFFF8FAFC);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightText =
      Color(0xFF0F172A); // Slate-900 for better contrast
  static const Color lightTextSecondary = Color(0xFF475569); // Slate-600
}

/// Gradient presets
class AppGradients {
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.gradientBlue, AppColors.gradientCyan],
  );

  static const LinearGradient backgroundGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0x0D3B82F6), // blue-500/5
      Color(0x0D06B6D4), // cyan-500/5
      Color(0x0D6366F1), // indigo-500/5
    ],
  );

  static const LinearGradient cardGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0x333B82F6), // blue with opacity
      Color(0x3306B6D4), // cyan with opacity
      Color(0x336366F1), // indigo with opacity
    ],
  );
}

/// App theme configuration
class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.deepNavy,
      primaryColor: AppColors.primaryBlue,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primaryBlue,
        secondary: AppColors.accentCyan,
        surface: AppColors.darkSurface,
        background: AppColors.deepNavy,
        error: AppColors.error,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: AppColors.textPrimary,
        onBackground: AppColors.textPrimary,
        onError: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: AppColors.textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
        iconTheme: IconThemeData(color: AppColors.textPrimary),
      ),
      cardTheme: CardThemeData(
        color: AppColors.cardBackground,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.borderLight),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkSurface.withOpacity(0.5),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.borderLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primaryBlue, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.error),
        ),
        labelStyle: const TextStyle(color: AppColors.textSecondary),
        hintStyle: const TextStyle(color: AppColors.textMuted),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primaryBlue,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 0,
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.accentCyan,
        ),
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(
            color: AppColors.textPrimary, fontWeight: FontWeight.bold),
        displayMedium: TextStyle(
            color: AppColors.textPrimary, fontWeight: FontWeight.bold),
        displaySmall: TextStyle(
            color: AppColors.textPrimary, fontWeight: FontWeight.bold),
        headlineLarge: TextStyle(
            color: AppColors.textPrimary, fontWeight: FontWeight.w600),
        headlineMedium: TextStyle(
            color: AppColors.textPrimary, fontWeight: FontWeight.w600),
        headlineSmall: TextStyle(
            color: AppColors.textPrimary, fontWeight: FontWeight.w600),
        titleLarge: TextStyle(
            color: AppColors.textPrimary, fontWeight: FontWeight.w600),
        titleMedium: TextStyle(
            color: AppColors.textPrimary, fontWeight: FontWeight.w500),
        titleSmall: TextStyle(color: AppColors.textSecondary),
        bodyLarge: TextStyle(color: AppColors.textPrimary),
        bodyMedium: TextStyle(color: AppColors.textSecondary),
        bodySmall: TextStyle(color: AppColors.textMuted),
        labelLarge: TextStyle(
            color: AppColors.textPrimary, fontWeight: FontWeight.w600),
        labelMedium: TextStyle(color: AppColors.textSecondary),
        labelSmall: TextStyle(color: AppColors.textMuted),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.borderLight,
        thickness: 1,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.darkSurface,
        selectedItemColor: AppColors.primaryBlue,
        unselectedItemColor: AppColors.textMuted,
      ),
    );
  }

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.lightBackground,
      primaryColor: AppColors.primaryBlue,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primaryBlue,
        secondary: AppColors.accentCyan,
        surface: AppColors.lightSurface,
        background: AppColors.lightBackground,
        error: AppColors.error,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: AppColors.lightText,
        onBackground: AppColors.lightText,
        onError: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: AppColors.lightText,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
        iconTheme: IconThemeData(color: AppColors.lightText),
      ),
      cardTheme: CardThemeData(
        color: AppColors.lightSurface.withOpacity(0.8),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.grey.shade200),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primaryBlue, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.error),
        ),
        labelStyle: TextStyle(color: Colors.grey.shade600),
        hintStyle: TextStyle(color: Colors.grey.shade400),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primaryBlue,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 0,
        ),
      ),
      textTheme: const TextTheme(
        displayLarge:
            TextStyle(color: AppColors.lightText, fontWeight: FontWeight.bold),
        displayMedium:
            TextStyle(color: AppColors.lightText, fontWeight: FontWeight.bold),
        displaySmall:
            TextStyle(color: AppColors.lightText, fontWeight: FontWeight.bold),
        headlineLarge:
            TextStyle(color: AppColors.lightText, fontWeight: FontWeight.w600),
        headlineMedium:
            TextStyle(color: AppColors.lightText, fontWeight: FontWeight.w600),
        headlineSmall:
            TextStyle(color: AppColors.lightText, fontWeight: FontWeight.w600),
        titleLarge:
            TextStyle(color: AppColors.lightText, fontWeight: FontWeight.w600),
        titleMedium:
            TextStyle(color: AppColors.lightText, fontWeight: FontWeight.w500),
        titleSmall: TextStyle(color: AppColors.lightTextSecondary),
        bodyLarge: TextStyle(color: AppColors.lightText),
        bodyMedium: TextStyle(color: AppColors.lightTextSecondary),
        bodySmall: TextStyle(color: AppColors.lightTextSecondary),
        labelLarge:
            TextStyle(color: AppColors.lightText, fontWeight: FontWeight.w600),
        labelMedium: TextStyle(color: AppColors.lightTextSecondary),
        labelSmall: TextStyle(color: AppColors.lightTextSecondary),
      ),
    );
  }
}
