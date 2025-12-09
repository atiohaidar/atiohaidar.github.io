import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/providers.dart';
import '../models/models.dart';
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
          builder: (context, state) =>
              GradientBackground(child: const RoomsScreen()),
        ),
        GoRoute(
          path: '/articles',
          name: 'articles',
          builder: (context, state) =>
              GradientBackground(child: const ArticlesScreen()),
        ),
        GoRoute(
          path: '/forms',
          name: 'forms',
          builder: (context, state) =>
              GradientBackground(child: const FormsScreen()),
        ),
        GoRoute(
          path: '/items',
          name: 'items',
          builder: (context, state) =>
              GradientBackground(child: const ItemsScreen()),
        ),
        GoRoute(
          path: '/users',
          name: 'users',
          builder: (context, state) =>
              GradientBackground(child: const UsersScreen()),
        ),
        GoRoute(
          path: '/chat',
          name: 'chat',
          builder: (context, state) =>
              GradientBackground(child: const ChatListScreen()),
        ),
        GoRoute(
          path: '/chat/:id',
          name: 'chat_detail',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            final extra = state.extra;

            ChatConversation? conversation;
            ChatGroup? group;
            bool isGroup = false;

            if (extra is ChatGroup) {
              group = extra;
              isGroup = true;
            } else if (extra is ChatConversation) {
              conversation = extra;
            }

            return GradientBackground(
                child: ChatScreen(
              conversationId: id,
              conversation: conversation,
              group: group,
              isGroup: isGroup,
            ));
          },
        ),
        GoRoute(
          path: '/groups/:id/members',
          name: 'group_members',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            final group = state.extra as ChatGroup?;
            return GradientBackground(
                child: GroupMembersScreen(groupId: id, group: group));
          },
        ),
        GoRoute(
          path: '/profile',
          name: 'profile',
          builder: (context, state) =>
              GradientBackground(child: const ProfileScreen()),
        ),
        GoRoute(
          path: '/notifications',
          name: 'notifications',
          builder: (context, state) =>
              GradientBackground(child: const NotificationsScreen()),
        ),
        GoRoute(
          path: '/tickets/:id',
          name: 'ticket_detail',
          builder: (context, state) {
            final idString = state.pathParameters['id']!;
            final id = int.tryParse(idString) ?? 0;
            final ticket = state.extra as Ticket?;
            return GradientBackground(
                child: TicketDetailScreen(ticketId: id, ticket: ticket));
          },
        ),
        GoRoute(
          path: '/discussions',
          name: 'discussions',
          builder: (context, state) =>
              GradientBackground(child: const DiscussionsScreen()),
        ),
        GoRoute(
          path: '/discussions/:id',
          name: 'discussion_detail',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            final discussion = state.extra as Discussion?;
            return GradientBackground(
                child: DiscussionDetailScreen(
                    discussionId: id, discussion: discussion));
          },
        ),
        GoRoute(
          path: '/borrowings/:id',
          name: 'borrowing_detail',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            final borrowing = state.extra as ItemBorrowing?;
            return GradientBackground(
                child: ItemBorrowingDetailScreen(
                    borrowingId: id, borrowing: borrowing));
          },
        ),
        GoRoute(
          path: '/events/:id',
          name: 'event_detail',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            final event = state.extra as Event?;
            return GradientBackground(
                child: EventDetailScreen(eventId: id, event: event));
          },
        ),
        GoRoute(
          path: '/anonymous-chat',
          name: 'anonymous_chat',
          builder: (context, state) => ChangeNotifierProvider(
            create: (_) => AnonymousChatProvider(),
            child: GradientBackground(child: const AnonymousChatScreen()),
          ),
        ),
        GoRoute(
          path: '/events/:id/scanner',
          name: 'event_scanner',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            final title = state.extra as String? ?? 'Event';
            return GradientBackground(
                child: EventScannerScreen(eventId: id, eventTitle: title));
          },
        ),
        GoRoute(
          path: '/forms/:id/responses',
          name: 'form_responses',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            final title = state.extra as String? ?? 'Form';
            return GradientBackground(
                child: FormResponsesScreen(formId: id, formTitle: title));
          },
        ),
        // Public routes (no auth required)
        GoRoute(
          path: '/public/tickets',
          name: 'public_ticket',
          builder: (context, state) =>
              GradientBackground(child: const PublicTicketScreen()),
        ),
        GoRoute(
          path: '/public/tickets/:token',
          name: 'public_ticket_detail',
          builder: (context, state) {
            final token = state.pathParameters['token']!;
            return GradientBackground(
                child: PublicTicketDetailScreen(token: token));
          },
        ),
        GoRoute(
          path: '/public/forms/:token',
          name: 'public_form',
          builder: (context, state) {
            final token = state.pathParameters['token']!;
            return GradientBackground(child: PublicFormScreen(token: token));
          },
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
