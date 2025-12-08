import 'dart:ui';
import 'package:flutter/material.dart';
import '../config/theme.dart';

/// A glassmorphism-style card widget matching the frontend design
class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final double borderRadius;
  final Color? backgroundColor;
  final double blur;
  final double opacity;
  final bool hasBorder;
  final Gradient? gradient;
  final VoidCallback? onTap;

  const GlassCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.borderRadius = 16,
    this.backgroundColor,
    this.blur = 10,
    this.opacity = 0.6,
    this.hasBorder = true,
    this.gradient,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    final cardColor = backgroundColor ?? 
      (isDark 
        ? AppColors.darkSurface.withOpacity(opacity)
        : Colors.white.withOpacity(opacity));
    
    final borderColor = isDark 
      ? AppColors.borderLight 
      : Colors.grey.shade200;

    Widget card = ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(borderRadius),
            border: hasBorder ? Border.all(color: borderColor) : null,
            gradient: gradient,
          ),
          padding: padding ?? const EdgeInsets.all(16),
          child: child,
        ),
      ),
    );

    if (margin != null) {
      card = Padding(padding: margin!, child: card);
    }

    if (onTap != null) {
      card = GestureDetector(onTap: onTap, child: card);
    }

    return card;
  }
}

/// A gradient-filled glass card for accent sections
class GradientGlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final double borderRadius;
  final List<Color>? gradientColors;
  final VoidCallback? onTap;

  const GradientGlassCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.borderRadius = 16,
    this.gradientColors,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colors = gradientColors ?? [
      AppColors.gradientBlue.withOpacity(0.2),
      AppColors.gradientCyan.withOpacity(0.2),
      AppColors.gradientIndigo.withOpacity(0.2),
    ];

    return GlassCard(
      padding: padding,
      margin: margin,
      borderRadius: borderRadius,
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: colors,
      ),
      onTap: onTap,
      child: child,
    );
  }
}
