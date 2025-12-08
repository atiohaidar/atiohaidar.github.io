import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/providers.dart';
import '../screens/screens.dart';
import '../widgets/widgets.dart';


/// App router configuration
class AppRouter {
  static final _rootNavigatorKey = GlobalKey<NavigatorState>();

  static GoRouter router(AuthProvider authProvider) {
    return GoRouter(
      navigatorKey: _rootNavigatorKey,
      initialLocation: '/',
      debugLogDiagnostics: true,
      refreshListenable: authProvider,
      redirect: (context, state) {
        final isAuthenticated = authProvider.isAuthenticated;
        final isLoggingIn = state.matchedLocation == '/login';
        final isInitializing = authProvider.state == AuthState.initial || 
                               authProvider.state == AuthState.loading;

        // Wait for initialization
        if (isInitializing) {
          return null;
        }

        // Redirect to login if not authenticated
        if (!isAuthenticated) {
          return isLoggingIn ? null : '/login';
        }

        // Redirect to dashboard if already authenticated
        if (isLoggingIn) {
          return '/';
        }

        return null;
      },
      routes: [
        GoRoute(
          path: '/login',
          name: 'login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/',
          name: 'dashboard',
          builder: (context, state) => const DashboardScreen(),
        ),
        GoRoute(
          path: '/rooms',
          name: 'rooms',
          builder: (context, state) => GradientBackground(child: const RoomsScreen()),
        ),
        GoRoute(
          path: '/articles',
          name: 'articles',
          builder: (context, state) => GradientBackground(child: const ArticlesScreen()),
        ),
        GoRoute(
          path: '/forms',
          name: 'forms',
          builder: (context, state) => GradientBackground(child: const FormsScreen()),
        ),
        GoRoute(
          path: '/items',
          name: 'items',
          builder: (context, state) => GradientBackground(child: const ItemsScreen()),
        ),
        GoRoute(
          path: '/users',
          name: 'users',
          builder: (context, state) => GradientBackground(child: const UsersScreen()),
        ),
      ],
      errorPageBuilder: (context, state) => MaterialPage(
        child: Scaffold(
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.error_outline,
                  size: 64,
                  color: Colors.red,
                ),
                const SizedBox(height: 16),
                Text(
                  'Page not found',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                Text(state.error?.message ?? 'Unknown error'),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => context.go('/'),
                  child: const Text('Go Home'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
