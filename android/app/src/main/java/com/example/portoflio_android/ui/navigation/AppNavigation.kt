package com.example.portoflio_android.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.example.portoflio_android.ui.screens.*

/**
 * Navigation route definitions.
 */
object Routes {
    const val LOGIN = "login"
    const val DASHBOARD = "dashboard"
    const val TASKS = "tasks"
    const val ROOMS = "rooms"
    const val ARTICLES = "articles"
    const val EVENTS = "events"
    const val TICKETS = "tickets"
    const val USERS = "users"
    const val FORMS = "forms"
    const val ITEMS = "items"
}

/**
 * Main navigation host for the app.
 */
@Composable
fun AppNavigation(
    navController: NavHostController,
    startDestination: String = Routes.LOGIN
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Routes.LOGIN) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Routes.DASHBOARD) {
            DashboardScreen(
                onNavigateToTasks = { navController.navigate(Routes.TASKS) },
                onNavigateToRooms = { navController.navigate(Routes.ROOMS) },
                onNavigateToArticles = { navController.navigate(Routes.ARTICLES) },
                onNavigateToEvents = { navController.navigate(Routes.EVENTS) },
                onNavigateToTickets = { navController.navigate(Routes.TICKETS) },
                onNavigateToUsers = { navController.navigate(Routes.USERS) },
                onNavigateToForms = { navController.navigate(Routes.FORMS) },
                onNavigateToItems = { navController.navigate(Routes.ITEMS) },
                onLogout = {
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(Routes.DASHBOARD) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Routes.TASKS) {
            TasksScreen(onNavigateBack = { navController.popBackStack() })
        }
        
        composable(Routes.ROOMS) {
            RoomsScreen(onNavigateBack = { navController.popBackStack() })
        }
        
        composable(Routes.ARTICLES) {
            ArticlesScreen(onNavigateBack = { navController.popBackStack() })
        }
        
        composable(Routes.EVENTS) {
            EventsScreen(onNavigateBack = { navController.popBackStack() })
        }
        
        composable(Routes.TICKETS) {
            TicketsScreen(onNavigateBack = { navController.popBackStack() })
        }
        
        composable(Routes.USERS) {
            UsersScreen(onNavigateBack = { navController.popBackStack() })
        }
        
        composable(Routes.FORMS) {
            FormsScreen(onNavigateBack = { navController.popBackStack() })
        }
        
        composable(Routes.ITEMS) {
            ItemsScreen(onNavigateBack = { navController.popBackStack() })
        }
    }
}
