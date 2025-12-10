package com.example.portoflio_android.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.portoflio_android.ui.viewmodel.AuthViewModel
import com.example.portoflio_android.ui.viewmodel.RegisterState

@Composable
fun RegisterScreen(
    viewModel: AuthViewModel = hiltViewModel(),
    onRegisterSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit
) {
    val registerState by viewModel.registerState.collectAsState()
    var username by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var confirmPasswordVisible by remember { mutableStateOf(false) }
    var passwordError by remember { mutableStateOf<String?>(null) }
    val focusManager = LocalFocusManager.current
    
    // Navigate on successful registration
    LaunchedEffect(registerState) {
        if (registerState is RegisterState.Success) {
            kotlinx.coroutines.delay(1500)
            viewModel.resetRegisterState()
            onRegisterSuccess()
        }
    }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF0F172A),
                        Color(0xFF1E293B),
                        Color(0xFF334155)
                    )
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Title
            Text(
                text = "Create Account",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = "Register to get started",
                fontSize = 16.sp,
                color = Color(0xFF94A3B8),
                modifier = Modifier.padding(bottom = 32.dp)
            )
            
            // Register Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp)),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFF1E293B).copy(alpha = 0.8f)
                )
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Username Field
                    OutlinedTextField(
                        value = username,
                        onValueChange = { username = it },
                        label = { Text("Username") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Text,
                            imeAction = ImeAction.Next
                        ),
                        keyboardActions = KeyboardActions(
                            onNext = { focusManager.moveFocus(FocusDirection.Down) }
                        ),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF22C55E),
                            unfocusedBorderColor = Color(0xFF475569),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedLabelColor = Color(0xFF22C55E),
                            unfocusedLabelColor = Color(0xFF94A3B8)
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )
                    
                    // Name Field
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Full Name") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Text,
                            imeAction = ImeAction.Next
                        ),
                        keyboardActions = KeyboardActions(
                            onNext = { focusManager.moveFocus(FocusDirection.Down) }
                        ),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF22C55E),
                            unfocusedBorderColor = Color(0xFF475569),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedLabelColor = Color(0xFF22C55E),
                            unfocusedLabelColor = Color(0xFF94A3B8)
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )
                    
                    // Password Field
                    OutlinedTextField(
                        value = password,
                        onValueChange = { 
                            password = it
                            passwordError = null
                        },
                        label = { Text("Password") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp),
                        singleLine = true,
                        visualTransformation = if (passwordVisible) 
                            VisualTransformation.None 
                        else 
                            PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Password,
                            imeAction = ImeAction.Next
                        ),
                        keyboardActions = KeyboardActions(
                            onNext = { focusManager.moveFocus(FocusDirection.Down) }
                        ),
                        trailingIcon = {
                            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                Icon(
                                    imageVector = if (passwordVisible) 
                                        Icons.Default.Visibility 
                                    else 
                                        Icons.Default.VisibilityOff,
                                    contentDescription = "Toggle password visibility",
                                    tint = Color(0xFF94A3B8)
                                )
                            }
                        },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF22C55E),
                            unfocusedBorderColor = Color(0xFF475569),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedLabelColor = Color(0xFF22C55E),
                            unfocusedLabelColor = Color(0xFF94A3B8)
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )
                    
                    // Confirm Password Field
                    OutlinedTextField(
                        value = confirmPassword,
                        onValueChange = { 
                            confirmPassword = it
                            passwordError = null
                        },
                        label = { Text("Confirm Password") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 16.dp),
                        singleLine = true,
                        visualTransformation = if (confirmPasswordVisible) 
                            VisualTransformation.None 
                        else 
                            PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Password,
                            imeAction = ImeAction.Done
                        ),
                        keyboardActions = KeyboardActions(
                            onDone = { 
                                focusManager.clearFocus()
                                if (password == confirmPassword) {
                                    viewModel.register(username, name, password)
                                } else {
                                    passwordError = "Passwords do not match"
                                }
                            }
                        ),
                        trailingIcon = {
                            IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                                Icon(
                                    imageVector = if (confirmPasswordVisible) 
                                        Icons.Default.Visibility 
                                    else 
                                        Icons.Default.VisibilityOff,
                                    contentDescription = "Toggle confirm password visibility",
                                    tint = Color(0xFF94A3B8)
                                )
                            }
                        },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF22C55E),
                            unfocusedBorderColor = Color(0xFF475569),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedLabelColor = Color(0xFF22C55E),
                            unfocusedLabelColor = Color(0xFF94A3B8)
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )
                    
                    // Password Error
                    passwordError?.let { error ->
                        Text(
                            text = error,
                            color = Color(0xFFEF4444),
                            fontSize = 14.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                    }
                    
                    // Status Messages
                    when (registerState) {
                        is RegisterState.Error -> {
                            Text(
                                text = (registerState as RegisterState.Error).message,
                                color = Color(0xFFEF4444),
                                fontSize = 14.sp,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.padding(bottom = 16.dp)
                            )
                        }
                        is RegisterState.Success -> {
                            Text(
                                text = "Registration successful! Redirecting to login...",
                                color = Color(0xFF22C55E),
                                fontSize = 14.sp,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.padding(bottom = 16.dp)
                            )
                        }
                        else -> {}
                    }
                    
                    // Register Button
                    Button(
                        onClick = { 
                            if (password == confirmPassword) {
                                viewModel.register(username, name, password)
                            } else {
                                passwordError = "Passwords do not match"
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        enabled = registerState !is RegisterState.Loading,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF22C55E)
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        if (registerState is RegisterState.Loading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text(
                                text = "Register",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                    
                    // Login Link
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 16.dp),
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "Already have an account? ",
                            color = Color(0xFF94A3B8),
                            fontSize = 14.sp
                        )
                        Text(
                            text = "Login",
                            color = Color(0xFF22C55E),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.clickable { onNavigateToLogin() }
                        )
                    }
                }
            }
        }
    }
}
