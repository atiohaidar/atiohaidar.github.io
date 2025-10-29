# Events Feature Documentation

## Overview
The Events (Acara) feature is a complete mobile implementation for managing events, attendee registration, and QR code-based attendance tracking.

## Features

### 1. Events List Screen (`EventsListScreen.tsx`)
- View all events in a card-based layout
- Filter events by:
  - All events
  - Upcoming events
  - Past events
- Pull-to-refresh functionality
- Creator badge for events created by current user
- Displays event date, location, and description
- Admin users can create new events

### 2. Event Detail Screen (`EventDetailScreen.tsx`)
- View complete event information
- Register for events (non-registered users)
- View and share personal QR code (registered users)
- Event statistics:
  - Total attendees
  - Present count
  - Registered count
- Admin/Creator features:
  - Edit event
  - Navigate to QR scanner
  - View attendee list with statuses
  - Delete event
- Status badges (Creator, Event Admin, Registered)

### 3. Event Form Screen (`EventFormScreen.tsx`)
- Create new events
- Edit existing events
- Form validation:
  - Required: Title, Date
  - Optional: Description, Location
- Date validation (prevents past dates for new events)
- Keyboard-aware scrolling

### 4. QR Scanner Screen (`EventScanScreen.tsx`)
- Camera-based QR code scanning
- Manual token input option (fallback)
- Real-time attendee verification
- Location tracking (optional)
- Confirmation modal before recording attendance
- Duplicate scan handling (shows info for already-present attendees)
- Success notifications with attendee info
- Permission handling for camera and location

### 5. Scan History Screen (`EventScanHistoryScreen.tsx`)
- View all scan records for an event
- Statistics:
  - Total scans
  - Unique attendees
  - Present count
- Filtering:
  - Search by username or scanner
  - Filter by scanner
- Detailed scan information:
  - Timestamp
  - Scanner name
  - Location link (Google Maps)
  - Attendee status

## Navigation

### Route Structure
```
/events                          → Events List
/events/new                      → Create Event Form
/events/[eventId]                → Event Detail
/events/[eventId]/edit           → Edit Event Form
/events/[eventId]/scan           → QR Scanner
/events/[eventId]/history        → Scan History
```

### Drawer Menu
Events are accessible from the main drawer menu with a calendar-star icon.

## User Permissions

### All Users
- View events list
- View event details
- Register for events
- View own QR code after registration

### Event Creators
- Edit their events
- Delete their events
- Scan QR codes
- View scan history
- Manage attendees

### Event Admins (assigned by creator)
- Scan QR codes
- View scan history
- Manage attendees
- Cannot edit or delete event

### System Admins
- Full access to all events
- Can delete any event
- Can assign event admins

## API Integration

### Event Endpoints
- `GET /api/events` - List all events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Attendee Endpoints
- `GET /api/events/:id/attendees` - List attendees
- `POST /api/events/:id/register` - Register for event
- `DELETE /api/events/:id/attendees/:attendeeId` - Unregister
- `PATCH /api/events/:id/attendees/:attendeeId/status` - Update status

### Admin Endpoints
- `GET /api/events/:id/admins` - List event admins
- `POST /api/events/:id/admins` - Assign admin
- `DELETE /api/events/:id/admins/:username` - Remove admin

### Scanning Endpoints
- `POST /api/events/:id/scan` - Record attendance scan
- `GET /api/events/:id/scan-history` - Get scan history

## Dependencies

### Required Packages
- `expo-camera` - Camera access for QR scanning
- `expo-barcode-scanner` - Barcode scanning functionality
- `react-native-qrcode-svg` - QR code generation
- `react-native-svg` - SVG support for QR codes
- `expo-location` - Location tracking for scans
- `@tanstack/react-query` - Data fetching and caching
- `react-native-paper` - UI components

## Styling

### Theme Colors Used
- `colors.text` - Primary text
- `colors.secondaryText` - Secondary/muted text
- `colors.background` - Screen background
- `colors.card` - Card backgrounds
- `colors.border` - Border colors
- `colors.primary` - Primary action color
- `colors.notification` - Success notifications
- `colors.info` - Info notifications

### Responsive Design
- All screens are mobile-optimized
- Flexible layouts for different screen sizes
- ScrollViews for long content
- Keyboard avoidance for forms
- Pull-to-refresh on lists

## QR Code Format

### Attendance Token
Each attendee receives a unique attendance token upon registration. This token:
- Is a UUID string
- Is embedded in the QR code
- Is validated against the event attendee list
- Cannot be reused across different events

### QR Code Display
- 200x200 pixels
- High error correction level
- White background, black foreground
- Can be shared via device share menu

## Error Handling

### Common Scenarios
1. **No Camera Permission**: Falls back to manual input
2. **No Location Permission**: Continues without location data
3. **Invalid Token**: Shows error in confirmation modal
4. **Network Errors**: Displayed via alerts
5. **Duplicate Scans**: Shows info message, still recorded

## Best Practices

### For Event Creators
1. Set event dates accurately
2. Provide clear location information
3. Assign event admins for large events
4. Review scan history after events

### For Attendees
1. Register early
2. Save QR code offline (screenshot)
3. Arrive early for scanning
4. Keep QR code accessible

### For Scanners
1. Ensure good lighting for camera
2. Use manual input if camera fails
3. Verify attendee name before confirming
4. Check scan history periodically

## Future Enhancements

### Potential Features
- Event capacity limits
- Waiting list functionality
- Event categories/tags
- Event images
- Push notifications
- Export attendance data
- Multiple check-in points
- Event feedback/ratings
- Calendar integration
- Social sharing

## Troubleshooting

### Common Issues

1. **QR Code Not Scanning**
   - Ensure camera permissions are granted
   - Try manual input instead
   - Check lighting conditions

2. **Registration Failed**
   - Check network connection
   - Verify event still accepts registrations
   - Contact event admin

3. **Location Not Recording**
   - Grant location permissions
   - Enable location services
   - Scans work without location

4. **Events Not Loading**
   - Pull to refresh
   - Check network connection
   - Verify API endpoint

## Support

For issues or questions:
1. Check this documentation
2. Review the source code comments
3. Contact the development team
4. Check the backend API documentation
