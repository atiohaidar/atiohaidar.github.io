package com.example.portoflio_android.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.portoflio_android.data.models.DashboardStats
import com.example.portoflio_android.ui.viewmodel.DashboardViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel = hiltViewModel(),
    onNavigateToTasks: () -> Unit,
    onNavigateToRooms: () -> Unit,
    onNavigateToArticles: () -> Unit,
    onNavigateToEvents: () -> Unit,
    onNavigateToTickets: () -> Unit,
    onNavigateToUsers: () -> Unit,
    onNavigateToForms: () -> Unit,
    onNavigateToItems: () -> Unit,
    onLogout: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    
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
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            // Top Bar
            TopAppBar(
                title = {
                    Text(
                        "Dashboard",
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                },
                actions = {
                    IconButton(onClick = { viewModel.refresh() }) {
                        Icon(
                            Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            tint = Color.White
                        )
                    }
                    IconButton(onClick = onLogout) {
                        Icon(
                            Icons.Default.Logout,
                            contentDescription = "Logout",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.Transparent
                )
            )
            
            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = Color(0xFF2563EB))
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    item {
                        Text(
                            "Overview",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }
                    
                    // Stats Grid
                    item {
                        uiState.stats?.let { stats ->
                            StatsGrid(stats)
                        }
                    }
                    
                    item {
                        Text(
                            "Quick Actions",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White,
                            modifier = Modifier.padding(top = 16.dp, bottom = 8.dp)
                        )
                    }
                    
                    // Quick Actions - Row 1
                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            QuickActionCard(
                                title = "Tasks",
                                icon = Icons.Default.Task,
                                color = Color(0xFF2563EB),
                                modifier = Modifier.weight(1f),
                                onClick = onNavigateToTasks
                            )
                            QuickActionCard(
                                title = "Rooms",
                                icon = Icons.Default.MeetingRoom,
                                color = Color(0xFF7C3AED),
                                modifier = Modifier.weight(1f),
                                onClick = onNavigateToRooms
                            )
                        }
                    }
                    
                    // Quick Actions - Row 2
                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            QuickActionCard(
                                title = "Articles",
                                icon = Icons.Default.Article,
                                color = Color(0xFF10B981),
                                modifier = Modifier.weight(1f),
                                onClick = onNavigateToArticles
                            )
                            QuickActionCard(
                                title = "Events",
                                icon = Icons.Default.Event,
                                color = Color(0xFFF59E0B),
                                modifier = Modifier.weight(1f),
                                onClick = onNavigateToEvents
                            )
                        }
                    }
                    
                    // Quick Actions - Row 3
                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            QuickActionCard(
                                title = "Tickets",
                                icon = Icons.Default.ConfirmationNumber,
                                color = Color(0xFFEF4444),
                                modifier = Modifier.weight(1f),
                                onClick = onNavigateToTickets
                            )
                            QuickActionCard(
                                title = "Users",
                                icon = Icons.Default.People,
                                color = Color(0xFF06B6D4),
                                modifier = Modifier.weight(1f),
                                onClick = onNavigateToUsers
                            )
                        }
                    }
                    
                    // Quick Actions - Row 4
                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            QuickActionCard(
                                title = "Forms",
                                icon = Icons.Default.Description,
                                color = Color(0xFFEC4899),
                                modifier = Modifier.weight(1f),
                                onClick = onNavigateToForms
                            )
                            QuickActionCard(
                                title = "Inventory",
                                icon = Icons.Default.Inventory,
                                color = Color(0xFF8B5CF6),
                                modifier = Modifier.weight(1f),
                                onClick = onNavigateToItems
                            )
                        }
                    }
                    
                    item { Spacer(modifier = Modifier.height(80.dp)) }
                }
            }
        }
        
        // Error Snackbar
        uiState.error?.let { error ->
            Snackbar(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(16.dp),
                containerColor = Color(0xFFEF4444)
            ) {
                Text(error)
            }
        }
    }
}

@Composable
private fun StatsGrid(stats: DashboardStats) {
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCard(
                title = "Tasks",
                value = "${stats.completedTasks}/${stats.totalTasks}",
                subtitle = "Completed",
                icon = Icons.Default.TaskAlt,
                color = Color(0xFF10B981),
                modifier = Modifier.weight(1f)
            )
            StatCard(
                title = "Articles",
                value = stats.publishedArticles.toString(),
                subtitle = "Published",
                icon = Icons.Default.Article,
                color = Color(0xFF2563EB),
                modifier = Modifier.weight(1f)
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCard(
                title = "Rooms",
                value = (stats.totalRooms ?: 0).toString(),
                subtitle = "Available",
                icon = Icons.Default.MeetingRoom,
                color = Color(0xFF7C3AED),
                modifier = Modifier.weight(1f)
            )
            StatCard(
                title = "Bookings",
                value = stats.pendingBookings.toString(),
                subtitle = "Pending",
                icon = Icons.Default.EventAvailable,
                color = Color(0xFFF59E0B),
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun StatCard(
    title: String,
    value: String,
    subtitle: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1E293B)
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    icon,
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    title,
                    fontSize = 14.sp,
                    color = Color(0xFF94A3B8)
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                value,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                subtitle,
                fontSize = 12.sp,
                color = Color(0xFF64748B)
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuickActionCard(
    title: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = modifier
            .clip(RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(
            containerColor = color.copy(alpha = 0.2f)
        )
    ) {
        Column(
            modifier = Modifier
                .padding(20.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                title,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White
            )
        }
    }
}
