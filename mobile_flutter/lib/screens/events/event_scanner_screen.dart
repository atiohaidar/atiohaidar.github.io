import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../config/theme.dart';
import '../../models/models.dart';
import '../../services/services.dart';
import '../../widgets/widgets.dart';

/// Event QR Scanner screen for attendance tracking
class EventScannerScreen extends StatefulWidget {
  final String eventId;
  final String eventTitle;

  const EventScannerScreen({
    super.key,
    required this.eventId,
    required this.eventTitle,
  });

  @override
  State<EventScannerScreen> createState() => _EventScannerScreenState();
}

class _EventScannerScreenState extends State<EventScannerScreen> {
  late MobileScannerController _controller;
  bool _isScanning = true;
  bool _isProcessing = false;
  AttendanceScan? _lastScan;
  String? _error;
  String? _successMessage;
  bool _torchEnabled = false;

  @override
  void initState() {
    super.initState();
    _controller = MobileScannerController(
      detectionSpeed: DetectionSpeed.normal,
      facing: CameraFacing.back,
      torchEnabled: false,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _processQRCode(String code) async {
    if (_isProcessing) return;

    // Pause scanning while processing
    _controller.stop();

    setState(() {
      _isProcessing = true;
      _error = null;
      _successMessage = null;
    });

    try {
      final scan = await ApiService.createAttendanceScan(widget.eventId, code);
      setState(() {
        _lastScan = scan;
        _successMessage = 'Attendance recorded successfully!';
        _isScanning = false;
      });
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
      });
      // Resume scanning on error
      _controller.start();
    } catch (e) {
      setState(() {
        _error = 'Failed to scan: $e';
      });
      // Resume scanning on error
      _controller.start();
    } finally {
      setState(() {
        _isProcessing = false;
      });
    }
  }

  void _resetScanner() {
    setState(() {
      _isScanning = true;
      _lastScan = null;
      _error = null;
      _successMessage = null;
    });
    _controller.start();
  }

  void _toggleTorch() {
    _controller.toggleTorch();
    setState(() {
      _torchEnabled = !_torchEnabled;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: Text('Scan: ${widget.eventTitle}'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        actions: [
          if (_isScanning)
            IconButton(
              icon: Icon(_torchEnabled ? Icons.flash_on : Icons.flash_off),
              onPressed: _toggleTorch,
            ),
        ],
      ),
      body: _buildBody(isDark),
    );
  }

  Widget _buildBody(bool isDark) {
    if (!_isScanning && _lastScan != null) {
      return _buildSuccessView(isDark);
    }

    return Column(
      children: [
        Expanded(
          flex: 3,
          child: _buildScannerView(isDark),
        ),
        Expanded(
          flex: 1,
          child: _buildControlsView(isDark),
        ),
      ],
    );
  }

  Widget _buildScannerView(bool isDark) {
    return Container(
      margin: const EdgeInsets.all(16),
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: AppColors.primaryBlue.withOpacity(0.5),
          width: 2,
        ),
      ),
      child: Stack(
        children: [
          MobileScanner(
            controller: _controller,
            onDetect: (capture) {
              final barcodes = capture.barcodes;
              if (barcodes.isNotEmpty && barcodes.first.rawValue != null) {
                _processQRCode(barcodes.first.rawValue!);
              }
            },
          ),
          // Overlay with scanning frame
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(
                  color: AppColors.primaryBlue,
                  width: 3,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
          // Corner markers
          Positioned.fill(
            child: CustomPaint(
              painter: _ScannerOverlayPainter(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildControlsView(bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          if (_error != null)
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: AppColors.error.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.error.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline, color: AppColors.error),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      _error!,
                      style: const TextStyle(color: AppColors.error),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.error),
                    onPressed: () => setState(() => _error = null),
                  ),
                ],
              ),
            ),
          if (_isProcessing)
            const LoadingIndicator(message: 'Processing scan...'),
          if (!_isProcessing)
            Text(
              'Point camera at attendee QR code',
              style: TextStyle(
                fontSize: 16,
                color: isDark
                    ? AppColors.textSecondary
                    : AppColors.lightTextSecondary,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSuccessView(bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: GlassCard(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.success.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check,
                  size: 48,
                  color: AppColors.success,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Success!',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppColors.textPrimary : AppColors.lightText,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _successMessage ?? 'Attendance recorded',
                style: TextStyle(
                  fontSize: 16,
                  color: isDark
                      ? AppColors.textSecondary
                      : AppColors.lightTextSecondary,
                ),
              ),
              if (_lastScan != null) ...[
                const SizedBox(height: 24),
                Text(
                  'Scanned at: ${_formatTime(_lastScan!.scannedAt)}',
                  style: TextStyle(
                    fontSize: 13,
                    color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                  ),
                ),
              ],
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _resetScanner,
                  icon: const Icon(Icons.qr_code_scanner),
                  label: const Text('Scan Next'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatTime(String? timestamp) {
    if (timestamp == null) return 'Unknown';
    try {
      final date = DateTime.parse(timestamp);
      return DateFormat('HH:mm:ss').format(date);
    } catch (_) {
      return timestamp;
    }
  }
}

/// Custom painter for scanner overlay corners
class _ScannerOverlayPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.accentCyan
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    const cornerLength = 30.0;
    final centerX = size.width / 2;
    final centerY = size.height / 2;
    const halfSize = 125.0;

    // Top-left corner
    canvas.drawLine(
      Offset(centerX - halfSize, centerY - halfSize + cornerLength),
      Offset(centerX - halfSize, centerY - halfSize),
      paint,
    );
    canvas.drawLine(
      Offset(centerX - halfSize, centerY - halfSize),
      Offset(centerX - halfSize + cornerLength, centerY - halfSize),
      paint,
    );

    // Top-right corner
    canvas.drawLine(
      Offset(centerX + halfSize - cornerLength, centerY - halfSize),
      Offset(centerX + halfSize, centerY - halfSize),
      paint,
    );
    canvas.drawLine(
      Offset(centerX + halfSize, centerY - halfSize),
      Offset(centerX + halfSize, centerY - halfSize + cornerLength),
      paint,
    );

    // Bottom-left corner
    canvas.drawLine(
      Offset(centerX - halfSize, centerY + halfSize - cornerLength),
      Offset(centerX - halfSize, centerY + halfSize),
      paint,
    );
    canvas.drawLine(
      Offset(centerX - halfSize, centerY + halfSize),
      Offset(centerX - halfSize + cornerLength, centerY + halfSize),
      paint,
    );

    // Bottom-right corner
    canvas.drawLine(
      Offset(centerX + halfSize - cornerLength, centerY + halfSize),
      Offset(centerX + halfSize, centerY + halfSize),
      paint,
    );
    canvas.drawLine(
      Offset(centerX + halfSize, centerY + halfSize),
      Offset(centerX + halfSize, centerY + halfSize - cornerLength),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
