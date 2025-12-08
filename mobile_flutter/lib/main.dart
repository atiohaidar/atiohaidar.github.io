import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'config/routes.dart';
import 'providers/providers.dart';
import 'widgets/widgets.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..initialize()),
        ChangeNotifierProvider(create: (_) => DashboardProvider()),
        ChangeNotifierProvider(create: (_) => TasksProvider()),
        ChangeNotifierProvider(create: (_) => TicketsProvider()),
        ChangeNotifierProvider(create: (_) => EventsProvider()),
        ChangeNotifierProvider(create: (_) => RoomsProvider()),
        ChangeNotifierProvider(create: (_) => ItemsProvider()),
        ChangeNotifierProvider(create: (_) => UsersProvider()),
        ChangeNotifierProvider(create: (_) => ArticlesProvider()),
      ],
      child: Consumer<AuthProvider>(
        builder: (context, authProvider, _) {
          final router = AppRouter.router(authProvider);
          
          return MaterialApp.router(
            title: 'Dashboard App',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: ThemeMode.dark, // Default to dark theme
            routerConfig: router,
            builder: (context, child) {
              // Show loading screen while initializing
              if (authProvider.state == AuthState.initial || 
                  authProvider.state == AuthState.loading) {
                return MaterialApp(
                  debugShowCheckedModeBanner: false,
                  theme: AppTheme.darkTheme,
                  home: const _SplashScreen(),
                );
              }
              return child ?? const SizedBox.shrink();
            },
          );
        },
      ),
    );
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GradientBackground(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.gradientBlue, AppColors.gradientCyan],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primaryBlue.withOpacity(0.3),
                      blurRadius: 30,
                      spreadRadius: 0,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.dashboard,
                  size: 48,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 32),
              const Text(
                'Dashboard',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 32),
              const SizedBox(
                width: 32,
                height: 32,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryBlue),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
