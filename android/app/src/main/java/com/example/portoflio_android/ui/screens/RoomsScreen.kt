package com.example.portoflio_android.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.portoflio_android.data.models.Booking
import com.example.portoflio_android.data.models.BookingStatus
import com.example.portoflio_android.data.models.Room
import com.example.portoflio_android.ui.viewmodel.RoomsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RoomsScreen(
    viewModel: RoomsViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedTab by remember { mutableStateOf(0) }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF0F172A),
                        Color(0xFF1E293B)
                    )
                )
            )
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            "Rooms & Bookings",
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = onNavigateBack) {
                            Icon(
                                Icons.Default.ArrowBack,
                                contentDescription = "Back",
                                tint = Color.White
                            )
                        }
                    },
                    actions = {
                        IconButton(onClick = { viewModel.refresh() }) {
                            Icon(
                                Icons.Default.Refresh,
                                contentDescription = "Refresh",
                                tint = Color.White
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.Transparent
                    )
                )
            },
            containerColor = Color.Transparent
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
            ) {
                // Tab Row
                TabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = Color.Transparent,
                    contentColor = Color.White,
                    indicator = { tabPositions ->
                        if (selectedTab < tabPositions.size) {
                            TabRowDefaults.SecondaryIndicator(
                                modifier = Modifier.fillMaxWidth(),
                                color = Color(0xFF2563EB)
                            )
                        }
                    }
                ) {
                    Tab(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        text = { Text("Rooms") }
                    )
                    Tab(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        text = { Text("My Bookings") }
                    )
                }
                
                if (uiState.isLoading) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = Color(0xFF2563EB))
                    }
                } else {
                    when (selectedTab) {
                        0 -> RoomsList(rooms = uiState.rooms)
                        1 -> BookingsList(
                            bookings = uiState.bookings,
                            onCancelBooking = { viewModel.cancelBooking(it) }
                        )
                    }
                }
            }
        }
        
        // Error Snackbar
        uiState.error?.let { error ->
            Snackbar(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(16.dp),
                containerColor = Color(0xFFEF4444),
                action = {
                    TextButton(onClick = { viewModel.clearError() }) {
                        Text("Dismiss", color = Color.White)
                    }
                }
            ) {
                Text(error)
            }
        }
    }
}

@Composable
private fun RoomsList(rooms: List<Room>) {
    if (rooms.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    Icons.Default.MeetingRoom,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = Color(0xFF475569)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text("No rooms available", color = Color(0xFF64748B))
            }
        }
    } else {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            items(rooms, key = { it.id }) { room ->
                RoomCard(room = room)
            }
        }
    }
}

@Composable
private fun RoomCard(room: Room) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1E293B)
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = room.name,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (room.available) Color(0xFF10B981).copy(alpha = 0.2f)
                    else Color(0xFFEF4444).copy(alpha = 0.2f)
                ) {
                    Text(
                        text = if (room.available) "Available" else "Unavailable",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        fontSize = 12.sp,
                        color = if (room.available) Color(0xFF10B981) else Color(0xFFEF4444)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Default.People,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = Color(0xFF64748B)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "Capacity: ${room.capacity}",
                    fontSize = 14.sp,
                    color = Color(0xFF94A3B8)
                )
            }
            
            room.description?.let { desc ->
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = desc,
                    fontSize = 14.sp,
                    color = Color(0xFF64748B),
                    maxLines = 2
                )
            }
        }
    }
}

@Composable
private fun BookingsList(
    bookings: List<Booking>,
    onCancelBooking: (String) -> Unit
) {
    if (bookings.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    Icons.Default.EventBusy,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = Color(0xFF475569)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text("No bookings yet", color = Color(0xFF64748B))
            }
        }
    } else {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            items(bookings, key = { it.id }) { booking ->
                BookingCard(
                    booking = booking,
                    onCancel = { onCancelBooking(booking.id) }
                )
            }
        }
    }
}

@Composable
private fun BookingCard(
    booking: Booking,
    onCancel: () -> Unit
) {
    val statusColor = when (booking.status) {
        BookingStatus.PENDING -> Color(0xFFF59E0B)
        BookingStatus.APPROVED -> Color(0xFF10B981)
        BookingStatus.REJECTED -> Color(0xFFEF4444)
        BookingStatus.CANCELLED -> Color(0xFF64748B)
    }
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1E293B)
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Room: ${booking.roomId}",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = statusColor.copy(alpha = 0.2f)
                ) {
                    Text(
                        text = booking.status.name.replace("_", " "),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        fontSize = 12.sp,
                        color = statusColor
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.Schedule,
                    contentDescription = null,
                    modifier = Modifier.size(14.dp),
                    tint = Color(0xFF64748B)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "${booking.startTime} - ${booking.endTime}",
                    fontSize = 13.sp,
                    color = Color(0xFF94A3B8)
                )
            }
            
            booking.purpose?.let { purpose ->
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = purpose,
                    fontSize = 14.sp,
                    color = Color(0xFF64748B)
                )
            }
            
            if (booking.status == BookingStatus.PENDING) {
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedButton(
                    onClick = onCancel,
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = Color(0xFFEF4444)
                    ),
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        brush = Brush.horizontalGradient(
                            listOf(Color(0xFFEF4444), Color(0xFFEF4444))
                        )
                    )
                ) {
                    Text("Cancel Booking")
                }
            }
        }
    }
}
