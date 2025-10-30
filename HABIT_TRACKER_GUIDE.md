# Habit Tracker Feature - User Guide

## Overview
The Habit Tracker feature allows logged-in users to create and track their daily routines and habits. Users can set different periods for their habits (daily, weekly, monthly, or custom) and check them off as they complete them. The system automatically tracks statistics like completion rate, current streak, and more.

## Features

### 1. Create Habits
- Click the "+ New Habit" button on the Habits page
- Fill in the form:
  - **Name**: Name of your habit (e.g., "Morning Exercise")
  - **Description**: Optional description
  - **Period Type**: Choose from:
    - Daily: Reset every day
    - Weekly: Reset every 7 days
    - Monthly: Reset every month
    - Custom: Set your own period in days
  - **Days per Period**: Only for custom period type

### 2. Track Habits
- Each habit displays a checkbox on the left
- Click the checkbox to mark the habit as complete for today
- Click again to unmark if you made a mistake
- Visual feedback: Completed habits show a green checkmark

### 3. View Statistics
Each habit card displays:
- **Streak**: Current consecutive completion streak (🔥 icon)
- **Completed**: Number of times completed out of total periods
- **Success Rate**: Percentage of successful completions
- **Progress Bar**: Visual representation of completion rate

### 4. Manage Habits
- **Delete**: Click the "Delete" button to remove a habit (confirmation required)
- Habits persist in the database and are tied to your user account

## API Endpoints

### Habits
- `GET /api/habits` - List all habits for the authenticated user
- `POST /api/habits` - Create a new habit
- `GET /api/habits/:habitId` - Get a specific habit with stats
- `PUT /api/habits/:habitId` - Update a habit
- `DELETE /api/habits/:habitId` - Delete a habit

### Habit Completions
- `GET /api/habits/:habitId/completions` - Get completion history
- `POST /api/habits/completions` - Mark a habit as complete
- `DELETE /api/habits/:habitId/completions?date=YYYY-MM-DD` - Unmark a completion

## Testing Guide

### Manual Testing Steps

1. **Login to the application**
   - Use default credentials: `admin/admin123` or `user/user123`

2. **Navigate to Habit Tracker**
   - Click on "Habit Tracker" (✅) in the dashboard sidebar

3. **Create a test habit**
   - Click "+ New Habit"
   - Name: "Test Habit"
   - Description: "This is a test"
   - Period Type: "Daily"
   - Click "Create Habit"

4. **Test completion tracking**
   - Click the checkbox to mark as complete
   - Verify the checkbox turns green with a checkmark
   - Verify the stats update (Streak should be 1, Completed should be 1/1, Success Rate should be 100%)
   - Click again to unmark
   - Verify the checkbox becomes empty again

5. **Test different period types**
   - Create habits with different period types (weekly, monthly, custom)
   - Verify they display the correct period label

6. **Test deletion**
   - Click "Delete" on a habit
   - Confirm the deletion
   - Verify the habit is removed from the list

### Backend API Testing (via OpenAPI/Swagger)

1. Start the backend: `cd backend && npm run dev`
2. Open browser to `http://localhost:8787/`
3. You'll see the OpenAPI documentation
4. Test the habit endpoints:
   - First, use `/api/auth/login` to get a token
   - Click "Authorize" and paste the token
   - Test each habit endpoint

### Frontend Testing

1. Start frontend: `cd frontend && npm run dev`
2. Open browser to `http://localhost:3000/`
3. Login with default credentials
4. Navigate to `/dashboard/habits`
5. Follow the manual testing steps above

## Database Schema

### habits table
```sql
- id TEXT PRIMARY KEY
- user_username TEXT (foreign key to users)
- name TEXT
- description TEXT
- period_type TEXT (daily, weekly, monthly, custom)
- period_days INTEGER
- created_at TEXT
- updated_at TEXT
```

### habit_completions table
```sql
- id TEXT PRIMARY KEY
- habit_id TEXT (foreign key to habits)
- user_username TEXT (foreign key to users)
- completion_date TEXT (YYYY-MM-DD format)
- created_at TEXT
- UNIQUE constraint on (habit_id, completion_date)
```

## Technical Details

### Statistics Calculation
- **Total Periods**: Calculated based on the number of periods that have passed since habit creation
- **Total Completions**: Count of completion records for the habit
- **Completion Percentage**: (Total Completions / Total Periods) * 100
- **Current Streak**: Number of consecutive periods with completions (breaks if a period is missed)
- **Is Completed Today**: Boolean indicating if today's date has a completion record

### Period Reset Logic
- The system doesn't automatically delete completions
- Stats are calculated dynamically based on the period type and habit creation date
- Users can complete a habit multiple times, but only once per date (enforced by UNIQUE constraint)

## Troubleshooting

### Issue: Can't see habits page
**Solution**: Make sure you're logged in. The habit tracker requires authentication.

### Issue: Habits not loading
**Solution**: 
1. Check browser console for errors
2. Verify backend is running on port 8787
3. Check frontend API configuration in `.env` files

### Issue: Can't create habit
**Solution**:
1. Ensure all required fields are filled (Name is required)
2. Check backend logs for validation errors
3. Verify you're authenticated

### Issue: Stats not updating
**Solution**:
1. Refresh the page
2. Check if the completion was successfully created (backend logs)
3. Verify the date calculation logic is working correctly

## Future Enhancements

Potential improvements that could be added:
- Calendar view showing completion history
- Graphs and charts for progress visualization
- Reminders/notifications for habits
- Habit templates/suggestions
- Sharing habits with other users
- Habit categories/tags
- Notes on each completion
- Streak recovery (grace period for missed days)
- Import/export habits
- Habit analytics and insights
