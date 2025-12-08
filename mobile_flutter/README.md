# Mobile Flutter App

A comprehensive Flutter mobile application with Modern Dark Glass UI theme, providing full access to all backend features.

## Features

### Core Functionality
- ✅ **Authentication** - Secure login/logout with JWT
- ✅ **Dashboard** - Overview statistics and quick actions
- ✅ **Task Management** - Create, update, complete tasks
- ✅ **Ticketing System** - Support tickets with comments
- ✅ **Events** - Event management with attendee registration
- ✅ **Room Booking** - Book rooms for meetings/events
- ✅ **Item Borrowing** - Borrow and manage inventory items
- ✅ **Articles** - Content management system
- ✅ **Forms** - Dynamic form creation and responses
- ✅ **Chat** - One-on-one messaging with WebSocket support
- ✅ **Group Chat** - Group messaging (API ready)
- ✅ **Discussion Forum** - Community forum with replies
- ✅ **User Management** - Admin user CRUD operations
- ✅ **Profile** - View and edit user profile

### UI/UX Highlights
- 🎨 Modern Dark Glass theme with gradient backgrounds
- 🔄 Pull-to-refresh on all list screens
- 📱 Responsive layouts for various screen sizes
- ⚡ Smooth animations and transitions
- 🎯 Intuitive navigation with bottom tabs
- 🔔 Real-time updates via WebSocket
- 💬 Toast notifications for user actions
- 🎭 Empty states and loading indicators
- ❌ Comprehensive error handling

## Project Structure

```
lib/
├── config/
│   ├── api_config.dart      # API configuration
│   ├── routes.dart          # App routing with GoRouter
│   └── theme.dart           # App theme and colors
├── models/
│   ├── article.dart
│   ├── booking.dart
│   ├── chat.dart
│   ├── discussion.dart      # NEW
│   ├── event.dart
│   ├── form.dart
│   ├── item.dart
│   ├── room.dart
│   ├── stats.dart
│   ├── task.dart
│   ├── ticket.dart
│   └── user.dart
├── providers/
│   ├── articles_provider.dart
│   ├── auth_provider.dart
│   ├── chat_provider.dart
│   ├── dashboard_provider.dart
│   ├── discussions_provider.dart  # NEW
│   ├── events_provider.dart
│   ├── forms_provider.dart
│   ├── items_provider.dart
│   ├── rooms_provider.dart
│   ├── tasks_provider.dart
│   ├── tickets_provider.dart
│   └── users_provider.dart
├── screens/
│   ├── articles/
│   ├── auth/
│   ├── chat/
│   ├── dashboard/
│   ├── discussions/         # NEW
│   ├── events/
│   │   └── event_detail_screen.dart  # NEW
│   ├── forms/
│   ├── items/
│   ├── notifications/
│   ├── profile/
│   ├── rooms/
│   ├── tasks/
│   ├── tickets/
│   └── users/
├── services/
│   ├── api_client.dart
│   ├── api_service.dart     # Main API service
│   ├── auth_service.dart
│   ├── storage_service.dart
│   └── websocket_service.dart
├── widgets/
│   ├── glass_card.dart      # Glassmorphism card
│   ├── gradient_background.dart
│   ├── loading_widgets.dart
│   └── stats_card.dart
└── main.dart
```

## Getting Started

### Prerequisites
- Flutter SDK (>=3.3.4 <4.0.0)
- Dart SDK
- Android Studio / VS Code with Flutter extensions
- iOS simulator / Android emulator or physical device

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile_flutter
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure API endpoint**
   
   Edit `lib/config/api_config.dart`:
   ```dart
   class ApiConfig {
     static const String baseUrl = 'https://your-api.com';
   }
   ```

4. **Run the app**
   ```bash
   # List available devices
   flutter devices
   
   # Run on connected device
   flutter run
   
   # Run in debug mode
   flutter run --debug
   
   # Run in release mode
   flutter run --release
   ```

### Building

#### Android APK
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

#### Android App Bundle
```bash
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

#### iOS
```bash
flutter build ios --release
# Then open Xcode to archive and export
```

## Development

### Code Style
This project follows the official [Flutter style guide](https://dart.dev/guides/language/effective-dart/style).

Run the analyzer:
```bash
flutter analyze
```

### State Management
The app uses the **Provider** pattern for state management:
- Each feature has its own provider (e.g., `TasksProvider`, `EventsProvider`)
- Providers handle API calls, state updates, and error handling
- UI components consume providers using `context.watch<T>()` or `context.read<T>()`

### Adding a New Feature

1. **Create the model** in `lib/models/`
2. **Add API methods** in `lib/services/api_service.dart`
3. **Create a provider** in `lib/providers/`
4. **Build the UI screen** in `lib/screens/`
5. **Add route** in `lib/config/routes.dart`
6. **Register provider** in `lib/main.dart`

Example:
```dart
// 1. Model (lib/models/example.dart)
class Example {
  final String id;
  final String name;
  // ...
}

// 2. API Service (lib/services/api_service.dart)
static Future<List<Example>> getExamples() async {
  final response = await ApiClient.get('/examples');
  return (response.data['data'] as List)
      .map((json) => Example.fromJson(json))
      .toList();
}

// 3. Provider (lib/providers/example_provider.dart)
class ExampleProvider extends ChangeNotifier {
  List<Example> _examples = [];
  
  Future<void> loadExamples() async {
    _examples = await ApiService.getExamples();
    notifyListeners();
  }
}

// 4. Screen (lib/screens/example/example_screen.dart)
class ExampleScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ExampleProvider>();
    // Build UI
  }
}

// 5. Route (lib/config/routes.dart)
GoRoute(
  path: '/examples',
  builder: (context, state) => ExampleScreen(),
)

// 6. Register Provider (lib/main.dart)
ChangeNotifierProvider(create: (_) => ExampleProvider()),
```

## API Integration

The app communicates with the backend REST API using Dio. All API calls go through `ApiService`.

### Authentication
- JWT tokens are stored securely using `flutter_secure_storage`
- Tokens are automatically included in API requests via Dio interceptor
- Refresh token flow is handled automatically

### Error Handling
```dart
try {
  final data = await ApiService.getSomething();
  // Success
} on ApiException catch (e) {
  // Handle error
  print(e.message);
}
```

## Testing

### Run tests
```bash
flutter test
```

### Integration tests
```bash
flutter test integration_test/
```

## Dependencies

### Core
- `flutter` - Flutter SDK
- `provider` ^6.1.1 - State management
- `go_router` ^13.2.0 - Navigation and routing
- `dio` ^5.4.0 - HTTP client
- `equatable` ^2.0.5 - Value equality

### Storage
- `flutter_secure_storage` ^9.0.0 - Secure token storage
- `shared_preferences` ^2.2.2 - Local preferences

### UI Components
- `flutter_svg` ^2.0.9 - SVG rendering
- `cached_network_image` ^3.3.1 - Image caching
- `shimmer` ^3.0.0 - Loading animations
- `cupertino_icons` ^1.0.6 - iOS-style icons

### Utilities
- `intl` ^0.18.1 - Internationalization and date formatting
- `web_socket_channel` ^2.4.0 - WebSocket support

### Dev Dependencies
- `flutter_test` - Testing framework
- `flutter_lints` ^3.0.0 - Linting rules

## Features in Detail

### Discussion Forum
- Browse community discussions
- Create discussions (authenticated or anonymous)
- Reply to discussions
- View discussion history
- Delete own discussions

### Enhanced Events
- View upcoming and past events
- Register/unregister for events
- View attendee list with status
- View event administrators
- QR code attendance tracking (API ready)

### Group Chat
- Create and manage groups
- Add/remove members
- Assign admin roles
- Send group messages
- Real-time updates (API ready)

## Configuration

### Environment Variables
Create a `.env` file (not tracked in git):
```
API_BASE_URL=https://api.example.com
WS_URL=wss://api.example.com/ws
```

### Build Flavors (Optional)
You can set up different flavors for dev/staging/prod:
```bash
flutter run --flavor dev
flutter run --flavor prod
```

## Troubleshooting

### Common Issues

**Issue: Build fails with dependency errors**
```bash
flutter clean
flutter pub get
```

**Issue: Hot reload doesn't work**
```bash
# Stop the app and run
flutter run --no-hot
```

**Issue: API calls fail**
- Check `lib/config/api_config.dart` has correct URL
- Ensure backend is running
- Check network connectivity
- Verify JWT token is valid

**Issue: White screen on launch**
- Check console for errors
- Verify all providers are registered
- Check routes are configured correctly

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `flutter analyze` and fix any issues
4. Test thoroughly on both iOS and Android
5. Submit a pull request

## License

[Specify your license here]

## Support

For issues and questions:
- Create an issue on GitHub
- Contact the development team

## Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Provider Documentation](https://pub.dev/packages/provider)
- [GoRouter Documentation](https://pub.dev/packages/go_router)
- [Dio Documentation](https://pub.dev/packages/dio)
