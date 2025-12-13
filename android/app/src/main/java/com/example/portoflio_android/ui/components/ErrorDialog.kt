package com.example.portoflio_android.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Error
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

/**
 * Reusable error dialog component with retry functionality
 */
@Composable
fun ErrorDialog(
    error: String,
    onDismiss: () -> Unit,
    onRetry: (() -> Unit)? = null
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = {
            Icon(
                Icons.Default.Error,
                contentDescription = null,
                tint = Color(0xFFEF4444)
            )
        },
        title = {
            Text(
                "Error",
                color = Color.White
            )
        },
        text = {
            Text(
                error,
                color = Color(0xFF94A3B8)
            )
        },
        confirmButton = {
            if (onRetry != null) {
                Button(
                    onClick = {
                        onDismiss()
                        onRetry()
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF2563EB)
                    )
                ) {
                    Text("Coba Lagi")
                }
            } else {
                Button(
                    onClick = onDismiss,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF2563EB)
                    )
                ) {
                    Text("OK")
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Tutup", color = Color(0xFF94A3B8))
            }
        },
        containerColor = Color(0xFF1E293B)
    )
}

@Composable
fun SuccessDialog(
    message: String,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                "Berhasil",
                color = Color.White
            )
        },
        text = {
            Text(
                message,
                color = Color(0xFF94A3B8)
            )
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF10B981)
                )
            ) {
                Text("OK")
            }
        },
        containerColor = Color(0xFF1E293B)
    )
}
