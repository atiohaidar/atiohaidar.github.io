package com.example.portoflio_android.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import com.example.portoflio_android.data.models.Item
import com.example.portoflio_android.data.models.ItemBorrowing
import com.example.portoflio_android.data.models.ItemBorrowingStatus
import com.example.portoflio_android.data.models.UserRole
import com.example.portoflio_android.ui.viewmodel.ItemsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ItemsScreen(
    viewModel: ItemsViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }
    var showBorrowDialog by remember { mutableStateOf<Item?>(null) }
    var selectedTab by remember { mutableIntStateOf(0) }
    
    // Load borrowings when tab changes
    LaunchedEffect(selectedTab) {
        if (selectedTab == 1) {
            viewModel.loadBorrowings()
        }
    }
    
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
                            "Inventory",
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = onNavigateBack) {
                            Icon(
                                Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back",
                                tint = Color.White
                            )
                        }
                    },
                    actions = {
                        IconButton(onClick = { 
                            viewModel.loadItems()
                            if (selectedTab == 1) viewModel.loadBorrowings()
                        }) {
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
            floatingActionButton = {
                if (selectedTab == 0) {
                    FloatingActionButton(
                        onClick = { showAddDialog = true },
                        containerColor = Color(0xFF2563EB),
                        contentColor = Color.White
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "Add Item")
                    }
                }
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
                    containerColor = Color(0xFF1E293B),
                    contentColor = Color.White,
                    divider = {},
                    indicator = @Composable { tabPositions ->
                        Box(
                            Modifier
                                .fillMaxWidth()
                                .wrapContentSize(Alignment.BottomStart)
                        ) {
                            if (selectedTab < tabPositions.size) {
                                Box(
                                    Modifier
                                        .offset(x = tabPositions[selectedTab].left)
                                        .width(tabPositions[selectedTab].width)
                                        .height(3.dp)
                                        .background(Color(0xFF2563EB), RoundedCornerShape(topStart = 3.dp, topEnd = 3.dp))
                                )
                            }
                        }
                    }
                ) {
                    Tab(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        text = { Text("Items", color = if (selectedTab == 0) Color.White else Color(0xFF94A3B8)) },
                        icon = { Icon(Icons.Default.Inventory, contentDescription = null, tint = if (selectedTab == 0) Color.White else Color(0xFF94A3B8)) }
                    )
                    Tab(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        text = { Text("Borrowings", color = if (selectedTab == 1) Color.White else Color(0xFF94A3B8)) },
                        icon = { Icon(Icons.Default.SwapHoriz, contentDescription = null, tint = if (selectedTab == 1) Color.White else Color(0xFF94A3B8)) }
                    )
                }
                
                when (selectedTab) {
                    0 -> ItemsTab(
                        items = uiState.items,
                        isLoading = uiState.isLoading,
                        currentUser = uiState.currentUser,
                        onDeleteItem = { viewModel.deleteItem(it) },
                        onBorrowItem = { showBorrowDialog = it }
                    )
                    1 -> BorrowingsTab(
                        borrowings = uiState.borrowings,
                        isLoading = uiState.isLoading,
                        currentUser = uiState.currentUser,
                        items = uiState.items,
                        onApprove = { viewModel.approveBorrowing(it) },
                        onReject = { viewModel.rejectBorrowing(it) },
                        onMarkReturned = { viewModel.markAsReturned(it) }
                    )
                }
            }
        }
        
        // Add Item Dialog
        if (showAddDialog) {
            AddItemDialog(
                onDismiss = { showAddDialog = false },
                onConfirm = { name, description, stock ->
                    viewModel.createItem(name, description, stock)
                    showAddDialog = false
                }
            )
        }
        
        // Borrow Item Dialog
        showBorrowDialog?.let { item ->
            BorrowItemDialog(
                item = item,
                onDismiss = { showBorrowDialog = null },
                onConfirm = { quantity, startDate, endDate, notes ->
                    viewModel.createBorrowing(item.id, quantity, startDate, endDate, notes)
                    showBorrowDialog = null
                }
            )
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
private fun ItemsTab(
    items: List<Item>,
    isLoading: Boolean,
    currentUser: com.example.portoflio_android.data.models.User?,
    onDeleteItem: (String) -> Unit,
    onBorrowItem: (Item) -> Unit
) {
    if (isLoading && items.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = Color(0xFF2563EB))
        }
    } else if (items.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    Icons.Default.Inventory,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = Color(0xFF475569)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text("No items in inventory", color = Color(0xFF64748B))
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
            items(items, key = { it.id }) { item ->
                val canModify = currentUser?.role == UserRole.ADMIN || 
                                item.ownerUsername == currentUser?.username
                val canBorrow = item.stock > 0 && item.ownerUsername != currentUser?.username
                ItemCard(
                    item = item,
                    showDeleteButton = canModify,
                    showBorrowButton = canBorrow,
                    onDelete = { onDeleteItem(item.id) },
                    onBorrow = { onBorrowItem(item) }
                )
            }
        }
    }
}

@Composable
private fun BorrowingsTab(
    borrowings: List<ItemBorrowing>,
    isLoading: Boolean,
    currentUser: com.example.portoflio_android.data.models.User?,
    items: List<Item>,
    onApprove: (String) -> Unit,
    onReject: (String) -> Unit,
    onMarkReturned: (String) -> Unit
) {
    if (isLoading && borrowings.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = Color(0xFF2563EB))
        }
    } else if (borrowings.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    Icons.Default.SwapHoriz,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = Color(0xFF475569)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text("No borrowing requests", color = Color(0xFF64748B))
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
            items(borrowings, key = { it.id }) { borrowing ->
                val item = items.find { it.id == borrowing.itemId }
                val isOwner = item?.ownerUsername == currentUser?.username
                val isAdmin = currentUser?.role == UserRole.ADMIN
                val canManage = (isOwner || isAdmin) && borrowing.status == ItemBorrowingStatus.PENDING
                val canMarkReturned = (isOwner || isAdmin) && borrowing.status == ItemBorrowingStatus.APPROVED
                
                BorrowingCard(
                    borrowing = borrowing,
                    itemName = item?.name ?: "Unknown Item",
                    canManage = canManage,
                    canMarkReturned = canMarkReturned,
                    onApprove = { onApprove(borrowing.id) },
                    onReject = { onReject(borrowing.id) },
                    onMarkReturned = { onMarkReturned(borrowing.id) }
                )
            }
        }
    }
}

@Composable
private fun ItemCard(
    item: Item,
    showDeleteButton: Boolean = true,
    showBorrowButton: Boolean = false,
    onDelete: () -> Unit,
    onBorrow: () -> Unit
) {
    val stockColor = when {
        item.stock <= 0 -> Color(0xFFEF4444)
        item.stock <= 5 -> Color(0xFFF59E0B)
        else -> Color(0xFF10B981)
    }
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1E293B)
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Icon
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFF334155),
                    modifier = Modifier.size(48.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            Icons.Default.Inventory2,
                            contentDescription = null,
                            tint = Color(0xFF94A3B8)
                        )
                    }
                }
                
                Spacer(modifier = Modifier.width(12.dp))
                
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = item.name,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White
                    )
                    item.description?.let { desc ->
                        Text(
                            text = desc,
                            fontSize = 14.sp,
                            color = Color(0xFF94A3B8),
                            maxLines = 1
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "by ${item.ownerUsername}",
                        fontSize = 12.sp,
                        color = Color(0xFF64748B)
                    )
                }
                
                Column(horizontalAlignment = Alignment.End) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = stockColor.copy(alpha = 0.2f)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.Inventory,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp),
                                tint = stockColor
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "${item.stock}",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = stockColor
                            )
                        }
                    }
                }
            }
            
            // Action buttons row
            if (showDeleteButton || showBorrowButton) {
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    if (showBorrowButton) {
                        Button(
                            onClick = onBorrow,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF2563EB)
                            ),
                            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                        ) {
                            Icon(
                                Icons.Default.SwapHoriz,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Borrow", fontSize = 14.sp)
                        }
                    }
                    if (showDeleteButton) {
                        Spacer(modifier = Modifier.width(8.dp))
                        IconButton(
                            onClick = onDelete,
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                Icons.Default.Delete,
                                contentDescription = "Delete",
                                tint = Color(0xFFEF4444),
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun BorrowingCard(
    borrowing: ItemBorrowing,
    itemName: String,
    canManage: Boolean,
    canMarkReturned: Boolean,
    onApprove: () -> Unit,
    onReject: () -> Unit,
    onMarkReturned: () -> Unit
) {
    val statusColor = when (borrowing.status) {
        ItemBorrowingStatus.PENDING -> Color(0xFFF59E0B)
        ItemBorrowingStatus.APPROVED -> Color(0xFF10B981)
        ItemBorrowingStatus.REJECTED -> Color(0xFFEF4444)
        ItemBorrowingStatus.RETURNED -> Color(0xFF6366F1)
        ItemBorrowingStatus.DAMAGED -> Color(0xFFEF4444)
        ItemBorrowingStatus.EXTENDED -> Color(0xFF2563EB)
    }
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1E293B)
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = itemName,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Qty: ${borrowing.quantity}",
                        fontSize = 14.sp,
                        color = Color(0xFF94A3B8)
                    )
                }
                
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = statusColor.copy(alpha = 0.2f)
                ) {
                    Text(
                        text = borrowing.status.name,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = statusColor
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.Person,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = Color(0xFF64748B)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "Borrower: ${borrowing.borrowerUsername}",
                    fontSize = 12.sp,
                    color = Color(0xFF64748B)
                )
            }
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.DateRange,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = Color(0xFF64748B)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "${borrowing.startDate.take(10)} → ${borrowing.endDate.take(10)}",
                    fontSize = 12.sp,
                    color = Color(0xFF64748B)
                )
            }
            
            borrowing.notes?.let { notes ->
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Notes: $notes",
                    fontSize = 12.sp,
                    color = Color(0xFF94A3B8),
                    maxLines = 2
                )
            }
            
            // Action buttons
            if (canManage || canMarkReturned) {
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    if (canManage) {
                        OutlinedButton(
                            onClick = onReject,
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = Color(0xFFEF4444)
                            ),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text("Reject", fontSize = 12.sp)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = onApprove,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF10B981)
                            ),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text("Approve", fontSize = 12.sp)
                        }
                    }
                    if (canMarkReturned) {
                        Button(
                            onClick = onMarkReturned,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF6366F1)
                            ),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Icon(
                                Icons.Default.Check,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Mark Returned", fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun BorrowItemDialog(
    item: Item,
    onDismiss: () -> Unit,
    onConfirm: (quantity: Int, startDate: String, endDate: String, notes: String?) -> Unit
) {
    var quantity by remember { mutableStateOf("1") }
    var notes by remember { mutableStateOf("") }
    var startDate by remember { mutableStateOf<Long?>(System.currentTimeMillis()) }
    var endDate by remember { mutableStateOf<Long?>(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000L) } // 7 days from now
    var showStartDatePicker by remember { mutableStateOf(false) }
    var showEndDatePicker by remember { mutableStateOf(false) }
    
    val dateFormat = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
    val displayFormat = java.text.SimpleDateFormat("MMM dd, yyyy", java.util.Locale.getDefault())
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Borrow Item", color = Color.White) },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                Text(
                    text = item.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF94A3B8)
                )
                Text(
                    text = "Available: ${item.stock}",
                    fontSize = 12.sp,
                    color = Color(0xFF64748B)
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedTextField(
                    value = quantity,
                    onValueChange = { newValue ->
                        val filtered = newValue.filter { it.isDigit() }
                        val num = filtered.toIntOrNull() ?: 0
                        if (num <= item.stock) {
                            quantity = filtered
                        }
                    },
                    label = { Text("Quantity") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF2563EB),
                        unfocusedBorderColor = Color(0xFF475569),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                // Start Date
                OutlinedButton(
                    onClick = { showStartDatePicker = true },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = Color.White
                    )
                ) {
                    Icon(Icons.Default.CalendarToday, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Start: ${startDate?.let { displayFormat.format(java.util.Date(it)) } ?: "Select Date"}"
                    )
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                // End Date
                OutlinedButton(
                    onClick = { showEndDatePicker = true },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = Color.White
                    )
                ) {
                    Icon(Icons.Default.CalendarToday, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "End: ${endDate?.let { displayFormat.format(java.util.Date(it)) } ?: "Select Date"}"
                    )
                }
                
                Spacer(modifier = Modifier.height(12.dp))
                
                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Notes (optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF2563EB),
                        unfocusedBorderColor = Color(0xFF475569),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val qty = quantity.toIntOrNull() ?: 1
                    val start = startDate?.let { dateFormat.format(java.util.Date(it)) } ?: ""
                    val end = endDate?.let { dateFormat.format(java.util.Date(it)) } ?: ""
                    onConfirm(qty, start, end, notes.ifBlank { null })
                },
                enabled = quantity.isNotBlank() && (quantity.toIntOrNull() ?: 0) > 0 && startDate != null && endDate != null,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB))
            ) {
                Text("Submit Request")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = Color(0xFF94A3B8))
            }
        },
        containerColor = Color(0xFF1E293B)
    )
    
    // Date Pickers
    if (showStartDatePicker) {
        val datePickerState = rememberDatePickerState(
            initialSelectedDateMillis = startDate ?: System.currentTimeMillis()
        )
        DatePickerDialog(
            onDismissRequest = { showStartDatePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    startDate = datePickerState.selectedDateMillis
                    showStartDatePicker = false
                }) {
                    Text("OK", color = Color(0xFF2563EB))
                }
            },
            dismissButton = {
                TextButton(onClick = { showStartDatePicker = false }) {
                    Text("Cancel", color = Color(0xFF94A3B8))
                }
            },
            colors = DatePickerDefaults.colors(containerColor = Color(0xFF1E293B))
        ) {
            DatePicker(
                state = datePickerState,
                colors = DatePickerDefaults.colors(
                    containerColor = Color(0xFF1E293B),
                    selectedDayContainerColor = Color(0xFF2563EB),
                    todayDateBorderColor = Color(0xFF2563EB)
                )
            )
        }
    }
    
    if (showEndDatePicker) {
        val datePickerState = rememberDatePickerState(
            initialSelectedDateMillis = endDate ?: System.currentTimeMillis()
        )
        DatePickerDialog(
            onDismissRequest = { showEndDatePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    endDate = datePickerState.selectedDateMillis
                    showEndDatePicker = false
                }) {
                    Text("OK", color = Color(0xFF2563EB))
                }
            },
            dismissButton = {
                TextButton(onClick = { showEndDatePicker = false }) {
                    Text("Cancel", color = Color(0xFF94A3B8))
                }
            },
            colors = DatePickerDefaults.colors(containerColor = Color(0xFF1E293B))
        ) {
            DatePicker(
                state = datePickerState,
                colors = DatePickerDefaults.colors(
                    containerColor = Color(0xFF1E293B),
                    selectedDayContainerColor = Color(0xFF2563EB),
                    todayDateBorderColor = Color(0xFF2563EB)
                )
            )
        }
    }
}

@Composable
private fun AddItemDialog(
    onDismiss: () -> Unit,
    onConfirm: (name: String, description: String?, stock: Int) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var stock by remember { mutableStateOf("1") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("New Item", color = Color.White) },
        text = {
            Column {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Item Name") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF2563EB),
                        unfocusedBorderColor = Color(0xFF475569),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF2563EB),
                        unfocusedBorderColor = Color(0xFF475569),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedTextField(
                    value = stock,
                    onValueChange = { stock = it.filter { c -> c.isDigit() } },
                    label = { Text("Stock") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF2563EB),
                        unfocusedBorderColor = Color(0xFF475569),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { 
                    onConfirm(
                        name,
                        description.takeIf { it.isNotBlank() },
                        stock.toIntOrNull() ?: 1
                    )
                },
                enabled = name.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB))
            ) {
                Text("Create")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = Color(0xFF94A3B8))
            }
        },
        containerColor = Color(0xFF1E293B)
    )
}
