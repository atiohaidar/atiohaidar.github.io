import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

/// Rooms screen for viewing rooms and bookings
class RoomsScreen extends StatefulWidget {
  const RoomsScreen({super.key});

  @override
  State<RoomsScreen> createState() => _RoomsScreenState();
}

class _RoomsScreenState extends State<RoomsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RoomsProvider>().loadAll();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final roomsProvider = context.watch<RoomsProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor:
          Colors.transparent, // Background handled by parent GradientBackground
      appBar: AppBar(
        title: const Text('Ruangan & Pesanan'),
        backgroundColor: Colors.transparent, // Transparent to show gradient
        elevation: 0,
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primaryBlue,
          unselectedLabelColor:
              isDark ? AppColors.textMuted : Colors.grey.shade600,
          indicatorColor: AppColors.primaryBlue,
          tabs: const [
            Tab(text: 'Ruangan'),
            Tab(text: 'Pesanan Saya'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildRoomsList(roomsProvider, isDark),
          _buildBookingsList(roomsProvider, isDark),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreateRoomDialog(context),
        backgroundColor: AppColors.primaryBlue,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  void _showCreateRoomDialog(BuildContext context) {
    final idController = TextEditingController();
    final nameController = TextEditingController();
    final capacityController = TextEditingController(text: '10');
    final descController = TextEditingController();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => Container(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: isDark
                          ? AppColors.borderMedium
                          : Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Buat Ruangan Baru',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.textPrimary : AppColors.lightText,
                  ),
                ),
                const SizedBox(height: 24),
                TextField(
                  controller: idController,
                  decoration: const InputDecoration(
                    labelText: 'ID Ruangan',
                    hintText: 'Mis: ROOM-A1',
                  ),
                  autofocus: true,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Nama Ruangan',
                    hintText: 'Masukkan nama ruangan',
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: capacityController,
                  decoration: const InputDecoration(
                    labelText: 'Kapasitas',
                    hintText: 'Jumlah orang',
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: descController,
                  decoration: const InputDecoration(
                    labelText: 'Deskripsi (opsional)',
                    hintText: 'Deskripsi ruangan',
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () async {
                    if (idController.text.trim().isNotEmpty &&
                        nameController.text.trim().isNotEmpty) {
                      final provider = context.read<RoomsProvider>();
                      final capacity =
                          int.tryParse(capacityController.text.trim()) ?? 10;

                      final success = await provider.createRoom(RoomCreate(
                        id: idController.text.trim(),
                        name: nameController.text.trim(),
                        capacity: capacity,
                        description: descController.text.trim().isNotEmpty
                            ? descController.text.trim()
                            : null,
                        available: true,
                      ));

                      if (success && context.mounted) {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Ruangan berhasil dibuat')),
                        );
                      }
                    }
                  },
                  child: const Text('Buat Ruangan'),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRoomsList(RoomsProvider provider, bool isDark) {
    if (provider.isLoading && provider.rooms.isEmpty) {
      return const LoadingIndicator(message: 'Memuat ruangan...');
    }

    if (provider.rooms.isEmpty) {
      return const EmptyState(
        icon: Icons.meeting_room_outlined,
        title: 'Tidak ada ruangan tersedia',
        subtitle: 'Ruangan akan muncul di sini',
      );
    }

    return RefreshIndicator(
      onRefresh: () => provider.loadRooms(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: provider.rooms.length,
        itemBuilder: (context, index) {
          final room = provider.rooms[index];
          return _buildRoomCard(room, isDark);
        },
      ),
    );
  }

  Widget _buildRoomCard(Room room, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: GlassCard(
        padding: const EdgeInsets.all(0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Room image placeholder
            Container(
              height: 150,
              decoration: BoxDecoration(
                color: isDark ? Colors.black26 : Colors.grey.shade200,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: Icon(
                Icons.meeting_room,
                size: 64,
                color: isDark ? Colors.white24 : Colors.grey.shade400,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          room.name,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: isDark
                                ? AppColors.textPrimary
                                : AppColors.lightText,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: room.available
                              ? AppColors.success.withOpacity(0.1)
                              : AppColors.error.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          room.available ? 'Tersedia' : 'Tidak Tersedia',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: room.available
                                ? AppColors.success
                                : AppColors.error,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Kapasitas: ${room.capacity} Orang',
                    style: TextStyle(
                      fontSize: 14,
                      color:
                          isDark ? AppColors.textMuted : Colors.grey.shade600,
                    ),
                  ),
                  if (room.description != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      room.description!,
                      style: TextStyle(
                        fontSize: 14,
                        color: isDark
                            ? AppColors.textSecondary
                            : AppColors.lightTextSecondary,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: room.available
                          ? () => _showBookRoomDialog(context, room)
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryBlue,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Pesan Ruangan'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showBookRoomDialog(BuildContext context, Room room) {
    final purposeController = TextEditingController();
    DateTime selectedDate = DateTime.now();
    TimeOfDay selectedTime = TimeOfDay.now();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => Container(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: isDark
                          ? AppColors.borderMedium
                          : Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Pesan ${room.name}',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.textPrimary : AppColors.lightText,
                  ),
                ),
                const SizedBox(height: 24),

                // Date Picker
                InkWell(
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: selectedDate,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 30)),
                    );
                    if (date != null) {
                      setState(() => selectedDate = date);
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: isDark
                            ? AppColors.borderMedium
                            : Colors.grey.shade300,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.calendar_today,
                            color: isDark
                                ? AppColors.textMuted
                                : Colors.grey.shade600),
                        const SizedBox(width: 12),
                        Text(
                          DateFormat('EEE, MMM d, y').format(selectedDate),
                          style: TextStyle(
                            color: isDark
                                ? AppColors.textPrimary
                                : AppColors.lightText,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Time Picker
                InkWell(
                  onTap: () async {
                    final time = await showTimePicker(
                      context: context,
                      initialTime: selectedTime,
                    );
                    if (time != null) {
                      setState(() => selectedTime = time);
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: isDark
                            ? AppColors.borderMedium
                            : Colors.grey.shade300,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.access_time,
                            color: isDark
                                ? AppColors.textMuted
                                : Colors.grey.shade600),
                        const SizedBox(width: 12),
                        Text(
                          selectedTime.format(context),
                          style: TextStyle(
                            color: isDark
                                ? AppColors.textPrimary
                                : AppColors.lightText,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                TextField(
                  controller: purposeController,
                  decoration: const InputDecoration(
                    labelText: 'Tujuan',
                    hintText: 'Tujuan pertemuan',
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () async {
                    if (purposeController.text.trim().isNotEmpty) {
                      final provider = context.read<RoomsProvider>();
                      final startTime = DateTime(
                        selectedDate.year,
                        selectedDate.month,
                        selectedDate.day,
                        selectedTime.hour,
                        selectedTime.minute,
                      );

                      // Assuming 1 hour duration for MVP or add duration picker
                      final endTime = startTime.add(const Duration(hours: 1));

                      final success =
                          await provider.createBooking(BookingCreate(
                        roomId: room.id,
                        startTime: startTime.toIso8601String(),
                        endTime: endTime.toIso8601String(),
                        title: purposeController.text.trim(),
                      ));

                      if (success && context.mounted) {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Ruangan berhasil dipesan!')),
                        );
                      }
                    }
                  },
                  child: const Text('Konfirmasi Pesanan'),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBookingsList(RoomsProvider provider, bool isDark) {
    if (provider.isLoading && provider.bookings.isEmpty) {
      return const LoadingIndicator(message: 'Memuat pesanan...');
    }

    if (provider.bookings.isEmpty) {
      return const EmptyState(
        icon: Icons.bookmark_border,
        title: 'Tidak ada pesanan',
        subtitle: 'Pesanan Anda akan muncul di sini',
      );
    }

    return RefreshIndicator(
      onRefresh: () => provider.loadBookings(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: provider.bookings.length,
        itemBuilder: (context, index) {
          final booking = provider.bookings[index];
          // Find the room name if possible
          final roomName = provider.rooms.isNotEmpty
              ? provider.rooms
                  .firstWhere(
                    (r) => r.id == booking.roomId,
                    orElse: () => const Room(
                        id: '',
                        name: 'Unknown Room',
                        capacity: 0,
                        available: false),
                  )
                  .name
              : 'Memuat...';

          return _buildBookingCard(booking, roomName, isDark);
        },
      ),
    );
  }

  Widget _buildBookingCard(Booking booking, String roomName, bool isDark) {
    final canCancel = booking.status == BookingStatus.pending ||
        booking.status == BookingStatus.approved;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassCard(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  roomName,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.textPrimary : AppColors.lightText,
                  ),
                ),
                _buildBookingStatusBadge(booking.status),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(
                  Icons.calendar_today,
                  size: 14,
                  color: isDark ? AppColors.textMuted : Colors.grey.shade500,
                ),
                const SizedBox(width: 6),
                Text(
                  '${DateFormat('MMM d, y').format(_safeParseDate(booking.startTime))} - ${DateFormat('HH:mm').format(_safeParseDate(booking.startTime))}',
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark
                        ? AppColors.textSecondary
                        : AppColors.lightTextSecondary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Alasan: ${booking.purpose ?? "Tidak ada tujuan"}',
              style: TextStyle(
                fontSize: 14,
                color: isDark ? AppColors.textMuted : Colors.grey.shade600,
              ),
            ),
            if (canCancel) ...[
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton.icon(
                  onPressed: () => _showCancelBookingDialog(booking),
                  icon: const Icon(Icons.cancel_outlined, size: 18),
                  label: const Text('Batal'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.error,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  /// Helper to parse DateTime safely
  DateTime _safeParseDate(String value) {
    try {
      if (value.isEmpty) return DateTime.now();
      // Handle SQL date format (replace space with T)
      if (value.contains(' ') && !value.contains('T')) {
        return DateTime.parse(value.replaceAll(' ', 'T'));
      }
      return DateTime.parse(value);
    } catch (_) {
      // If parsing fails (e.g. data is '21'), return now as fallback
      // This prevents the entire UI from crashing
      return DateTime.now();
    }
  }

  void _showCancelBookingDialog(Booking booking) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Batalkan Pesanan'),
        content: const Text('Apakah Anda yakin ingin membatalkan pesanan ini?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Tidak'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              final provider = context.read<RoomsProvider>();
              final success = await provider.cancelBooking(booking.id);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(success
                        ? 'Pesanan berhasil dibatalkan'
                        : provider.error ?? 'Gagal membatalkan pesanan'),
                    backgroundColor:
                        success ? AppColors.success : AppColors.error,
                  ),
                );
              }
            },
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Ya, Batalkan'),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingStatusBadge(BookingStatus status) {
    Color color;
    Color bgColor;
    String text;

    switch (status) {
      case BookingStatus.approved:
        color = const Color(0xFF059669);
        bgColor = const Color(0xFFD1FAE5);
        text = 'Disetujui';
        break;
      case BookingStatus.pending:
        color = const Color(0xFFD97706);
        bgColor = const Color(0xFFFEF3C7);
        text = 'Menunggu';
        break;
      case BookingStatus.rejected:
        color = const Color(0xFFDC2626);
        bgColor = const Color(0xFFFEE2E2);
        text = 'Ditolak';
        break;
      case BookingStatus.cancelled:
        color = Colors.grey;
        bgColor = Colors.grey.shade200;
        text = 'Dibatalkan';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}
