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
        title: const Text('Rooms & Bookings'),
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
            Tab(text: 'Rooms'),
            Tab(text: 'My Bookings'),
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
    );
  }

  Widget _buildRoomsList(RoomsProvider provider, bool isDark) {
    if (provider.isLoading && provider.rooms.isEmpty) {
      return const LoadingIndicator(message: 'Loading rooms...');
    }

    if (provider.rooms.isEmpty) {
      return const EmptyState(
        icon: Icons.meeting_room_outlined,
        title: 'No rooms available',
        subtitle: 'Rooms will appear here',
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
                          room.available ? 'Available' : 'Unavailable',
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
                    'Capacity: ${room.capacity} people',
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
                      child: const Text('Book Room'),
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
                  'Book ${room.name}',
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
                    labelText: 'Purpose',
                    hintText: 'Meeting purpose',
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
                        purpose: purposeController.text.trim(),
                      ));

                      if (success && context.mounted) {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Room booked successfully!')),
                        );
                      }
                    }
                  },
                  child: const Text('Confirm Booking'),
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
      return const LoadingIndicator(message: 'Loading bookings...');
    }

    if (provider.bookings.isEmpty) {
      return const EmptyState(
        icon: Icons.bookmark_border,
        title: 'No bookings',
        subtitle: 'Your bookings will appear here',
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
              : 'Loading...';

          return _buildBookingCard(booking, roomName, isDark);
        },
      ),
    );
  }

  Widget _buildBookingCard(Booking booking, String roomName, bool isDark) {
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
                  '${DateFormat('MMM d, y').format(DateTime.parse(booking.startTime))} - ${DateFormat('HH:mm').format(DateTime.parse(booking.startTime))}',
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
              'Reason: ${booking.purpose ?? "No purpose"}',
              style: TextStyle(
                fontSize: 14,
                color: isDark ? AppColors.textMuted : Colors.grey.shade600,
              ),
            ),
          ],
        ),
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
        text = 'Approved';
        break;
      case BookingStatus.pending:
        color = const Color(0xFFD97706);
        bgColor = const Color(0xFFFEF3C7);
        text = 'Pending';
        break;
      case BookingStatus.rejected:
        color = const Color(0xFFDC2626);
        bgColor = const Color(0xFFFEE2E2);
        text = 'Rejected';
        break;
      case BookingStatus.cancelled:
        color = Colors.grey;
        bgColor = Colors.grey.shade200;
        text = 'Cancelled';
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
