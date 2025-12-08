import 'package:flutter/material.dart';
import '../config/theme.dart';

/// Animated gradient background matching the frontend design
class GradientBackground extends StatelessWidget {
  final Widget child;
  final bool showBlobs;

  const GradientBackground({
    super.key,
    required this.child,
    this.showBlobs = true,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.deepNavy : AppColors.lightBackground,
      ),
      child: Stack(
        children: [
          // Base gradient overlay
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColors.gradientBlue.withOpacity(0.05),
                    AppColors.gradientCyan.withOpacity(0.05),
                    AppColors.gradientIndigo.withOpacity(0.05),
                  ],
                ),
              ),
            ),
          ),
          
          // Animated blobs
          if (showBlobs) ...[
            Positioned(
              top: -100,
              right: -50,
              child: _AnimatedBlob(
                color: AppColors.primaryBlue.withOpacity(isDark ? 0.2 : 0.1),
                size: 300,
                animationOffset: 0,
              ),
            ),
            Positioned(
              bottom: -100,
              left: -50,
              child: _AnimatedBlob(
                color: AppColors.accentCyan.withOpacity(isDark ? 0.2 : 0.1),
                size: 350,
                animationOffset: 2,
              ),
            ),
            Positioned(
              top: MediaQuery.of(context).size.height * 0.4,
              right: -100,
              child: _AnimatedBlob(
                color: AppColors.accentIndigo.withOpacity(isDark ? 0.15 : 0.08),
                size: 250,
                animationOffset: 4,
              ),
            ),
          ],
          
          // Content
          child,
        ],
      ),
    );
  }
}

/// Animated blob widget for background decoration
class _AnimatedBlob extends StatefulWidget {
  final Color color;
  final double size;
  final double animationOffset;

  const _AnimatedBlob({
    required this.color,
    required this.size,
    this.animationOffset = 0,
  });

  @override
  State<_AnimatedBlob> createState() => _AnimatedBlobState();
}

class _AnimatedBlobState extends State<_AnimatedBlob>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<Offset> _positionAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(seconds: 8 + widget.animationOffset.toInt()),
      vsync: this,
    )..repeat(reverse: true);

    _scaleAnimation = Tween<double>(begin: 0.9, end: 1.1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    _positionAnimation = Tween<Offset>(
      begin: Offset.zero,
      end: const Offset(20, 20),
    ).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.translate(
          offset: _positionAnimation.value,
          child: Transform.scale(
            scale: _scaleAnimation.value,
            child: Container(
              width: widget.size,
              height: widget.size,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: widget.color,
                boxShadow: [
                  BoxShadow(
                    color: widget.color.withOpacity(0.5),
                    blurRadius: 100,
                    spreadRadius: 20,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
