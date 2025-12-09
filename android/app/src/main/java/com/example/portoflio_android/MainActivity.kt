package com.example.portoflio_android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.rememberNavController
import com.example.portoflio_android.ui.navigation.AppNavigation
import com.example.portoflio_android.ui.navigation.Routes
import com.example.portoflio_android.ui.theme.PortfolioAndroidTheme
import com.example.portoflio_android.ui.viewmodel.AuthState
import com.example.portoflio_android.ui.viewmodel.AuthViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        setContent {
            PortfolioAndroidTheme(dynamicColor = false) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF0F172A)
                ) {
                    val navController = rememberNavController()
                    val authViewModel: AuthViewModel = hiltViewModel()
                    val authState by authViewModel.authState.collectAsState()
                    
                    // Determine start destination based on auth state
                    val startDestination = when (authState) {
                        is AuthState.Authenticated -> Routes.DASHBOARD
                        else -> Routes.LOGIN
                    }
                    
                    // Navigate when auth state changes
                    LaunchedEffect(authState) {
                        when (authState) {
                            is AuthState.Authenticated -> {
                                if (navController.currentDestination?.route == Routes.LOGIN) {
                                    navController.navigate(Routes.DASHBOARD) {
                                        popUpTo(Routes.LOGIN) { inclusive = true }
                                    }
                                }
                            }
                            is AuthState.Unauthenticated -> {
                                if (navController.currentDestination?.route != Routes.LOGIN) {
                                    navController.navigate(Routes.LOGIN) {
                                        popUpTo(0) { inclusive = true }
                                    }
                                }
                            }
                            else -> {}
                        }
                    }
                    
                    AppNavigation(
                        navController = navController,
                        startDestination = startDestination
                    )
                }
            }
        }
    }
}
