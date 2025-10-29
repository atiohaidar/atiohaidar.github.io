# New API Features in Expo Mobile App

This document describes the newly added API features that are now available in the Expo mobile app.

## Overview

All backend features that were previously only available in the frontend web app have now been added to the mobile app. The following features are now fully supported:

## 1. Forms API

Create, manage, and respond to forms.

### Available Methods:
- `listForms()` - Get all forms created by the authenticated user
- `getForm(formId)` - Get a specific form with its questions
- `getFormByToken(token)` - Get a form by its public token (for respondents)
- `createForm(form)` - Create a new form with questions
- `updateForm(formId, updates)` - Update an existing form
- `deleteForm(formId)` - Delete a form
- `submitFormResponse(token, response)` - Submit a response to a form
- `getFormResponses(formId)` - Get all responses for a form
- `getFormResponseDetail(formId, responseId)` - Get detailed response with answers

### Example Usage:
```typescript
import apiService from '@/services/api';

// Create a new form
const newForm = await apiService.createForm({
  title: 'Customer Feedback',
  description: 'Please share your feedback',
  questions: [
    { question_text: 'How satisfied are you?', question_order: 1 },
    { question_text: 'Any suggestions?', question_order: 2 }
  ]
});

// Get form by token (public access)
const form = await apiService.getFormByToken('abc123xyz');

// Submit a response
await apiService.submitFormResponse('abc123xyz', {
  respondent_name: 'John Doe',
  answers: [
    { question_id: 'q1', answer_text: 'Very satisfied' },
    { question_id: 'q2', answer_text: 'Great service!' }
  ]
});
```

## 2. Tickets API

Create and manage support tickets.

### Available Methods:
- `listTicketCategories()` - Get all ticket categories
- `listTickets(params?)` - List tickets with optional filters
- `getTicket(ticketId)` - Get a specific ticket (authenticated)
- `getTicketByToken(token)` - Get a ticket by its public token
- `createTicket(ticket)` - Create a new ticket (public)
- `updateTicket(ticketId, updates)` - Update a ticket (authenticated)
- `deleteTicket(ticketId)` - Delete a ticket (admin only)
- `listTicketComments(ticketId, includeInternal?)` - Get ticket comments
- `listTicketCommentsByToken(token)` - Get comments by token
- `createTicketComment(ticketId, comment)` - Add a comment (authenticated)
- `createTicketCommentByToken(token, comment)` - Add a comment by token
- `listTicketAssignments(ticketId)` - Get assignment history
- `assignTicket(ticketId, assignment)` - Assign a ticket to a user
- `getTicketStats(assignedTo?)` - Get ticket statistics

### Example Usage:
```typescript
// Create a ticket (public - no authentication needed)
const ticket = await apiService.createTicket({
  title: 'Login Issue',
  description: 'Cannot log in to my account',
  category_id: 1,
  priority: 'high',
  submitter_name: 'Jane Smith',
  submitter_email: 'jane@example.com'
});

// Track ticket by token
const myTicket = await apiService.getTicketByToken(ticket.token);

// Add a comment using token
await apiService.createTicketCommentByToken(ticket.token, {
  comment_text: 'I tried resetting my password but it did not work',
  commenter_name: 'Jane Smith'
});

// Get ticket stats (authenticated)
const stats = await apiService.getTicketStats();
console.log(`Open tickets: ${stats.open}`);
```

## 3. Items API

Manage inventory items.

### Available Methods:
- `listItems(params?)` - List items with optional owner filter
- `getItem(itemId)` - Get a specific item
- `createItem(item)` - Create a new item
- `updateItem(itemId, updates)` - Update an item
- `deleteItem(itemId)` - Delete an item

### Example Usage:
```typescript
// Create an item
const item = await apiService.createItem({
  name: 'Projector',
  description: 'HD Projector for presentations',
  stock: 3,
  attachment_link: 'https://example.com/manual.pdf'
});

// List all items
const items = await apiService.listItems();

// List items by owner
const myItems = await apiService.listItems({ owner: 'username' });
```

## 4. Item Borrowings API

Manage item borrowing requests.

### Available Methods:
- `listItemBorrowings(params?)` - List borrowings with optional filters
- `getItemBorrowing(borrowingId)` - Get a specific borrowing
- `createItemBorrowing(borrowing)` - Create a borrowing request
- `updateItemBorrowingStatus(borrowingId, updates)` - Update borrowing status
- `cancelItemBorrowing(borrowingId)` - Cancel a borrowing request

### Example Usage:
```typescript
// Request to borrow an item
const borrowing = await apiService.createItemBorrowing({
  item_id: 'item-123',
  quantity: 1,
  start_date: '2024-01-15',
  end_date: '2024-01-20',
  notes: 'Need for presentation'
});

// Update borrowing status (item owner or admin)
await apiService.updateItemBorrowingStatus('borrow-456', {
  status: 'approved',
  notes: 'Approved. Please pick up from room 101.'
});

// List my borrowings
const myBorrowings = await apiService.listItemBorrowings();
```

## 5. Discussions API

Participate in community discussions.

### Available Methods:
- `listDiscussions()` - Get all discussions
- `getDiscussion(discussionId)` - Get a discussion with replies
- `createDiscussion(discussion)` - Create a new discussion
- `createDiscussionReply(discussionId, reply)` - Reply to a discussion
- `deleteDiscussion(discussionId)` - Delete a discussion (creator or admin)

### Example Usage:
```typescript
// Create a discussion (can be anonymous)
const discussion = await apiService.createDiscussion({
  title: 'New Feature Suggestion',
  content: 'It would be great to have dark mode',
  creator_name: 'John Doe' // Optional if authenticated
});

// Get discussion with all replies
const fullDiscussion = await apiService.getDiscussion(discussion.id);

// Reply to discussion
await apiService.createDiscussionReply(discussion.id, {
  content: 'I agree! Dark mode would be awesome.',
  creator_name: 'Jane Smith' // Optional if authenticated
});

// List all discussions
const discussions = await apiService.listDiscussions();
```

## Type Definitions

All TypeScript types for these APIs are available in `@/types/api`. Import them as needed:

```typescript
import type {
  Form, FormCreate, FormResponse,
  Ticket, TicketCreate, TicketCategory,
  Item, ItemCreate,
  ItemBorrowing, ItemBorrowingCreate,
  Discussion, DiscussionCreate
} from '@/types/api';
```

## Authentication

Most endpoints require authentication. Make sure the user is logged in before calling authenticated endpoints. Public endpoints (like creating tickets, viewing forms by token, etc.) do not require authentication.

The API service automatically includes the authentication token in requests when available.

## Error Handling

All API methods throw errors if the request fails. Use try-catch blocks to handle errors:

```typescript
try {
  const items = await apiService.listItems();
  console.log('Items:', items);
} catch (error) {
  console.error('Failed to load items:', error.message);
  // Show error to user
}
```

## Notes

- All API methods return Promises and should be used with `async/await` or `.then()/.catch()`
- The API base URL can be configured via the `EXPO_PUBLIC_API_BASE_URL` environment variable
- Response data is automatically extracted from the API response format
- Network connectivity is checked automatically, and errors are emitted via the error events system
