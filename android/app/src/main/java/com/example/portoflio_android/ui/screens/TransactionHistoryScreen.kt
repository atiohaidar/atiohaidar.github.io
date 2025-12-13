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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.portoflio_android.data.models.Transaction
import com.example.portoflio_android.data.models.TransactionType
import com.example.portoflio_android.ui.viewmodel.TransactionHistoryViewModel
import java.text.SimpleDateFormat
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TransactionHistoryScreen(
    viewModel: TransactionHistoryViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            TopAppBar(
                title = {
                    Text(
                        "Riwayat Transaksi",
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
                    IconButton(onClick = { viewModel.loadTransactions() }) {
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
            
            // Filter Chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = uiState.selectedFilter == null,
                    onClick = { viewModel.filterByType(null) },
                    label = { Text("Semua") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF2563EB),
                        selectedLabelColor = Color.White,
                        containerColor = Color(0xFF1E293B),
                        labelColor = Color(0xFF94A3B8)
                    )
                )
                
                FilterChip(
                    selected = uiState.selectedFilter == TransactionType.TOPUP,
                    onClick = { viewModel.filterByType(TransactionType.TOPUP) },
                    label = { Text("Isi Ulang") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF10B981),
                        selectedLabelColor = Color.White,
                        containerColor = Color(0xFF1E293B),
                        labelColor = Color(0xFF94A3B8)
                    )
                )
                
                FilterChip(
                    selected = uiState.selectedFilter == TransactionType.TRANSFER,
                    onClick = { viewModel.filterByType(TransactionType.TRANSFER) },
                    label = { Text("Transfer") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFFEF4444),
                        selectedLabelColor = Color.White,
                        containerColor = Color(0xFF1E293B),
                        labelColor = Color(0xFF94A3B8)
                    )
                )
                
                FilterChip(
                    selected = uiState.selectedFilter == TransactionType.RECEIVE,
                    onClick = { viewModel.filterByType(TransactionType.RECEIVE) },
                    label = { Text("Terima") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Color(0xFF8B5CF6),
                        selectedLabelColor = Color.White,
                        containerColor = Color(0xFF1E293B),
                        labelColor = Color(0xFF94A3B8)
                    )
                )
            }
            
            if (uiState.isLoading && uiState.transactions.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = Color(0xFF2563EB))
                }
            } else if (uiState.filteredTransactions.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.Receipt,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = Color(0xFF475569)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            "Tidak ada transaksi ditemukan",
                            color = Color(0xFF64748B),
                            fontSize = 16.sp
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(uiState.filteredTransactions, key = { it.id }) { transaction ->
                        TransactionCard(transaction = transaction)
                    }
                }
            }
        }
        
        // Error Dialog
        uiState.error?.let { error ->
            com.example.portoflio_android.ui.components.ErrorDialog(
                error = error,
                onDismiss = { viewModel.clearError() },
                onRetry = { viewModel.loadTransactions() }
            )
        }
    }
}

@Composable
private fun TransactionCard(transaction: Transaction) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1E293B)
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                // Icon based on type
                val (icon, iconColor) = when (transaction.type) {
                    TransactionType.TOPUP -> Icons.Default.Add to Color(0xFF10B981)
                    TransactionType.TRANSFER -> Icons.Default.ArrowUpward to Color(0xFFEF4444)
                    TransactionType.RECEIVE -> Icons.Default.ArrowDownward to Color(0xFF8B5CF6)
                    TransactionType.WITHDRAWAL -> Icons.Default.Remove to Color(0xFFF59E0B)
                }
                
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = iconColor.copy(alpha = 0.2f),
                    modifier = Modifier.size(40.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            icon,
                            contentDescription = null,
                            tint = iconColor,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
                
                Spacer(modifier = Modifier.width(12.dp))
                
                Column {
                    Text(
                        text = getTransactionTypeLabel(transaction.type),
                        color = Color.White,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 16.sp
                    )
                    
                    transaction.description?.let { desc ->
                        Text(
                            text = desc,
                            color = Color(0xFF94A3B8),
                            fontSize = 13.sp,
                            maxLines = 1
                        )
                    }
                    
                    // Show from/to username
                    when (transaction.type) {
                        TransactionType.TRANSFER -> transaction.toUsername?.let {
                            Text(
                                text = "Kepada: @$it",
                                color = Color(0xFF64748B),
                                fontSize = 12.sp
                            )
                        }
                        TransactionType.RECEIVE -> transaction.fromUsername?.let {
                            Text(
                                text = "Dari: @$it",
                                color = Color(0xFF64748B),
                                fontSize = 12.sp
                            )
                        }
                        else -> {}
                    }
                    
                    transaction.createdAt?.let { date ->
                        Text(
                            text = formatDate(date),
                            color = Color(0xFF475569),
                            fontSize = 11.sp
                        )
                    }
                }
            }
            
            Column(horizontalAlignment = Alignment.End) {
                val isPositive = transaction.type == TransactionType.TOPUP || transaction.type == TransactionType.RECEIVE
                Text(
                    text = "${if (isPositive) "+" else "-"}Rp ${String.format("%.0f", transaction.amount)}",
                    color = if (isPositive) Color(0xFF10B981) else Color(0xFFEF4444),
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
                
                transaction.balance?.let { balance ->
                    Text(
                        text = "Saldo: Rp ${String.format("%.0f", balance)}",
                        color = Color(0xFF64748B),
                        fontSize = 11.sp
                    )
                }
            }
        }
    }
}

private fun formatDate(dateString: String): String {
    return try {
        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
        val outputFormat = SimpleDateFormat("dd MMM yyyy, HH:mm", Locale.getDefault())
        val date = inputFormat.parse(dateString)
        if (date != null) outputFormat.format(date) else dateString
    } catch (e: Exception) {
        dateString
    }
}

private fun getTransactionTypeLabel(type: TransactionType): String {
    return when (type) {
        TransactionType.TOPUP -> "Isi Ulang"
        TransactionType.TRANSFER -> "Transfer"
        TransactionType.RECEIVE -> "Terima"
        TransactionType.WITHDRAWAL -> "Penarikan"
    }
}
