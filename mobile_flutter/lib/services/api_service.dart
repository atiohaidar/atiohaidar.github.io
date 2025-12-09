import 'package:dio/dio.dart' hide FormData;
import '../models/models.dart';
import 'api_client.dart';

/// API service for all backend operations
class ApiService {
  // Stats
  static Future<DashboardStats> getStats() async {
    try {
      final response = await ApiClient.get('/stats');
      return DashboardStats.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // Users
  static Future<List<User>> getUsers() async {
    try {
      final response = await ApiClient.get('/users');
      final users = (response.data['users'] as List)
          .map((json) => User.fromJson(json))
          .toList();
      return users;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<User> createUser(UserCreate data) async {
    try {
      final response = await ApiClient.post('/users', data: data.toJson());
      return User.fromJson(response.data['user']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<User> updateUser(String username, UserUpdate data) async {
    try {
      final response =
          await ApiClient.put('/users/$username', data: data.toJson());
      return User.fromJson(response.data['user']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<void> deleteUser(String username) async {
    try {
      await ApiClient.delete('/users/$username');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Update current user's profile (self-update)
  static Future<User> updateProfile(UserUpdate data) async {
    try {
      final response = await ApiClient.put('/profile', data: data.toJson());
      return User.fromJson(response.data['user']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // Tasks
  static Future<List<Task>> getTasks({int? page, bool? isCompleted}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (page != null) queryParams['page'] = page;
      if (isCompleted != null) queryParams['is_completed'] = isCompleted;

      final response =
          await ApiClient.get('/tasks', queryParameters: queryParams);
      final tasks = (response.data['tasks'] as List)
          .map((json) => Task.fromJson(json))
          .toList();
      return tasks;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Task> getTask(int id) async {
    try {
      final response = await ApiClient.get('/tasks/$id');
      return Task.fromJson(response.data['task']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Task> createTask(TaskCreate data) async {
    try {
      final response = await ApiClient.post('/tasks', data: data.toJson());
      return Task.fromJson(response.data['task']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Task> updateTask(int id, TaskUpdate data) async {
    try {
      final response = await ApiClient.put('/tasks/$id', data: data.toJson());
      return Task.fromJson(response.data['task']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<void> deleteTask(int id) async {
    try {
      await ApiClient.delete('/tasks/$id');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // Articles
  static Future<List<Article>> getArticles() async {
    try {
      final response = await ApiClient.get('/articles');
      final articles = (response.data['articles'] as List)
          .map((json) => Article.fromJson(json))
          .toList();
      return articles;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Article> getArticle(String slug) async {
    try {
      final response = await ApiClient.get('/articles/$slug');
      return Article.fromJson(response.data['article']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Article> createArticle(ArticleCreate data) async {
    try {
      final response = await ApiClient.post('/articles', data: data.toJson());
      return Article.fromJson(response.data['article']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Article> updateArticle(String slug, ArticleUpdate data) async {
    try {
      final response =
          await ApiClient.put('/articles/$slug', data: data.toJson());
      return Article.fromJson(response.data['article']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<void> deleteArticle(String slug) async {
    try {
      await ApiClient.delete('/articles/$slug');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // Rooms
  static Future<List<Room>> getRooms() async {
    try {
      final response = await ApiClient.get('/rooms');
      final rooms = (response.data['data'] as List)
          .map((json) => Room.fromJson(json))
          .toList();
      return rooms;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Room> getRoom(String id) async {
    try {
      final response = await ApiClient.get('/rooms/$id');
      return Room.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Room> createRoom(RoomCreate data) async {
    try {
      final response = await ApiClient.post('/rooms', data: data.toJson());
      return Room.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Room> updateRoom(String id, RoomUpdate data) async {
    try {
      final response = await ApiClient.put('/rooms/$id', data: data.toJson());
      return Room.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<void> deleteRoom(String id) async {
    try {
      await ApiClient.delete('/rooms/$id');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // Bookings
  static Future<List<Booking>> getBookings() async {
    try {
      final response = await ApiClient.get('/bookings');
      final bookings = (response.data['data'] as List)
          .map((json) => Booking.fromJson(json))
          .toList();
      return bookings;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Booking> createBooking(BookingCreate data) async {
    try {
      final response = await ApiClient.post('/bookings', data: data.toJson());
      return Booking.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Booking> updateBookingStatus(
      String id, BookingUpdate data) async {
    try {
      final response =
          await ApiClient.put('/bookings/$id', data: data.toJson());
      return Booking.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<void> cancelBooking(String id) async {
    try {
      await ApiClient.delete('/bookings/$id');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Booking> getBooking(String id) async {
    try {
      final response = await ApiClient.get('/bookings/$id');
      return Booking.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Booking> updateBooking(String id, BookingUpdate data) async {
    try {
      final response =
          await ApiClient.put('/bookings/$id/edit', data: data.toJson());
      return Booking.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // Tickets
  static Future<List<Ticket>> getTickets({String? status}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (status != null) queryParams['status'] = status;

      final response =
          await ApiClient.get('/tickets', queryParameters: queryParams);
      final tickets = (response.data['data'] as List)
          .map((json) => Ticket.fromJson(json))
          .toList();
      return tickets;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Ticket> getTicket(int id) async {
    try {
      final response = await ApiClient.get('/tickets/$id');
      return Ticket.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Ticket> createTicket(TicketCreate data) async {
    try {
      final response = await ApiClient.post('/tickets', data: data.toJson());
      return Ticket.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Ticket> updateTicket(int id, TicketUpdate data) async {
    try {
      final response = await ApiClient.put('/tickets/$id', data: data.toJson());
      return Ticket.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<TicketStats> getTicketStats() async {
    try {
      final response = await ApiClient.get('/tickets/stats');
      return TicketStats.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<List<TicketComment>> getTicketComments(int ticketId) async {
    try {
      final response = await ApiClient.get('/tickets/$ticketId/comments');
      final comments = (response.data['data'] as List)
          .map((json) => TicketComment.fromJson(json))
          .toList();
      return comments;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<TicketComment> addTicketComment(
      int ticketId, String comment) async {
    try {
      final response = await ApiClient.post(
        '/tickets/$ticketId/comments',
        data: {'comment_text': comment},
      );
      return TicketComment.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<List<TicketCategory>> getTicketCategories() async {
    try {
      final response = await ApiClient.get('/tickets/categories');
      final categories = (response.data['data'] as List)
          .map((json) => TicketCategory.fromJson(json))
          .toList();
      return categories;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Get ticket assignment history
  static Future<List<TicketAssignment>> getTicketAssignments(
      int ticketId) async {
    try {
      final response = await ApiClient.get('/tickets/$ticketId/assignments');
      final assignments = (response.data['data'] as List)
          .map((json) => TicketAssignment.fromJson(json))
          .toList();
      return assignments;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Assign ticket to a user
  static Future<TicketAssignment> assignTicket(
      int ticketId, TicketAssign data) async {
    try {
      final response = await ApiClient.post(
        '/tickets/$ticketId/assign',
        data: data.toJson(),
      );
      return TicketAssignment.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // Events
  static Future<List<Event>> getEvents() async {
    try {
      final response = await ApiClient.get('/events');
      final events = (response.data['data'] as List)
          .map((json) => Event.fromJson(json))
          .toList();
      return events;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Event> getEvent(String id) async {
    try {
      final response = await ApiClient.get('/events/$id');
      return Event.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Event> createEvent(EventCreate data) async {
    try {
      final response = await ApiClient.post('/events', data: data.toJson());
      return Event.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Event> updateEvent(String id, EventUpdate data) async {
    try {
      final response = await ApiClient.put('/events/$id', data: data.toJson());
      return Event.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<void> deleteEvent(String id) async {
    try {
      await ApiClient.delete('/events/$id');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<List<EventAttendee>> getEventAttendees(String eventId) async {
    try {
      final response = await ApiClient.get('/events/$eventId/attendees');
      final attendees = (response.data['data'] as List)
          .map((json) => EventAttendee.fromJson(json))
          .toList();
      return attendees;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<EventAttendee> registerForEvent(String eventId) async {
    try {
      final response = await ApiClient.post('/events/register', data: {
        'event_id': eventId,
      });
      return EventAttendee.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<void> unregisterFromEvent(
      String eventId, String attendeeId) async {
    try {
      await ApiClient.delete('/events/$eventId/attendees/$attendeeId');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<EventAttendee> updateAttendeeStatus(
      String eventId, String attendeeId, String status) async {
    try {
      final response = await ApiClient.put(
        '/events/$eventId/attendees/$attendeeId/status',
        data: {'status': status},
      );
      return EventAttendee.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<List<EventAdmin>> getEventAdmins(String eventId) async {
    try {
      final response = await ApiClient.get('/events/$eventId/admins');
      final admins = (response.data['data'] as List)
          .map((json) => EventAdmin.fromJson(json))
          .toList();
      return admins;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<EventAdmin> assignEventAdmin(
      String eventId, String username) async {
    try {
      final response = await ApiClient.post(
        '/events/$eventId/admins',
        data: {'username': username},
      );
      return EventAdmin.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<void> removeEventAdmin(String eventId, String username) async {
    try {
      await ApiClient.delete('/events/$eventId/admins/$username');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<AttendanceScan> createAttendanceScan(
      String eventId, String attendanceToken) async {
    try {
      final response = await ApiClient.post(
        '/events/$eventId/scan',
        data: {'attendance_token': attendanceToken},
      );
      return AttendanceScan.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<List<AttendanceScan>> getEventScanHistory(
      String eventId) async {
    try {
      final response = await ApiClient.get('/events/$eventId/scan-history');
      final scans = (response.data['data'] as List)
          .map((json) => AttendanceScan.fromJson(json))
          .toList();
      return scans;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // Items
  static Future<List<Item>> getItems() async {
    try {
      final response = await ApiClient.get('/items');
      final items = (response.data['data'] as List)
          .map((json) => Item.fromJson(json))
          .toList();
      return items;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Item> createItem(ItemCreate data) async {
    try {
      final response = await ApiClient.post('/items', data: data.toJson());
      return Item.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<void> deleteItem(String id) async {
    try {
      await ApiClient.delete('/items/$id');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // Item Borrowings
  static Future<List<ItemBorrowing>> getItemBorrowings() async {
    try {
      final response = await ApiClient.get('/item-borrowings');
      final borrowings = (response.data['data'] as List)
          .map((json) => ItemBorrowing.fromJson(json))
          .toList();
      return borrowings;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<ItemBorrowing> createItemBorrowing(
      ItemBorrowingCreate data) async {
    try {
      final response =
          await ApiClient.post('/item-borrowings', data: data.toJson());
      return ItemBorrowing.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<ItemBorrowing> updateItemBorrowingStatus(
      String borrowingId, String status) async {
    try {
      final response = await ApiClient.put(
        '/item-borrowings/$borrowingId/status',
        data: {'status': status},
      );
      return ItemBorrowing.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<void> cancelItemBorrowing(String borrowingId) async {
    try {
      await ApiClient.delete('/item-borrowings/$borrowingId');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<ItemBorrowing> getItemBorrowing(String borrowingId) async {
    try {
      final response = await ApiClient.get('/item-borrowings/$borrowingId');
      return ItemBorrowing.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // Forms
  static Future<List<FormData>> getForms() async {
    try {
      final response = await ApiClient.get('/forms');
      final forms = (response.data['data'] as List)
          .map((json) => FormData.fromJson(json))
          .toList();
      return forms;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<FormWithQuestions> getForm(String id) async {
    try {
      final response = await ApiClient.get('/forms/$id');
      return FormWithQuestions.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<FormData> createForm(FormCreate data) async {
    try {
      final response = await ApiClient.post('/forms', data: data.toJson());
      // The API returns the created form data, maybe without questions in the root or wrapped
      // Adjusting based on standard response pattern
      return FormData.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<void> deleteForm(String id) async {
    try {
      await ApiClient.delete('/forms/$id');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<List<FormResponse>> getFormResponses(String formId) async {
    try {
      final response = await ApiClient.get('/forms/$formId/responses');
      final responses = (response.data['data'] as List)
          .map((json) => FormResponse.fromJson(json))
          .toList();
      return responses;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<FormResponseDetail> getFormResponse(
      String formId, String responseId) async {
    try {
      final response =
          await ApiClient.get('/forms/$formId/responses/$responseId');
      return FormResponseDetail.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // Chat
  static Future<List<ChatConversation>> getConversations() async {
    try {
      final response = await ApiClient.get('/chat/conversations');
      final conversations = (response.data['data'] as List)
          .map((json) => ChatConversation.fromJson(json))
          .toList();
      return conversations;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<ChatConversation> createConversation(
      String otherUsername) async {
    try {
      final response = await ApiClient.post('/chat/conversations',
          data: {'username': otherUsername});
      return ChatConversation.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<List<ChatMessage>> getMessages(String conversationId) async {
    try {
      final response =
          await ApiClient.get('/chat/conversations/$conversationId/messages');
      final messages = (response.data['data'] as List)
          .map((json) => ChatMessage.fromJson(json))
          .toList();
      // Ensure messages are sorted by date (if API returns them reversed)
      // Usually chat UIs want newest at bottom, but generic ListView wants them in order
      return messages;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<ChatMessage> sendMessage(MessageCreate data) async {
    try {
      // Note: Backend API structure for messaging:
      // - Individual messages: POST /api/messages (handles both conversation and group via body)
      // - Fetch conversation messages: GET /api/conversations/:id/messages
      // - Fetch group messages: GET /api/groups/:groupId/messages
      // The MessageCreate model includes conversationId or groupId to route correctly
      final response = await ApiClient.post('/messages', data: data.toJson());
      return ChatMessage.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // Group Chat
  static Future<List<ChatGroup>> getGroups() async {
    try {
      final response = await ApiClient.get('/groups');
      final groups = (response.data['data'] as List)
          .map((json) => ChatGroup.fromJson(json))
          .toList();
      return groups;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<ChatGroup> getGroup(String groupId) async {
    try {
      final response = await ApiClient.get('/groups/$groupId');
      return ChatGroup.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<ChatGroup> createGroup(GroupCreate data) async {
    try {
      final response = await ApiClient.post('/groups', data: data.toJson());
      return ChatGroup.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<ChatGroup> updateGroup(String groupId, GroupUpdate data) async {
    try {
      final response =
          await ApiClient.put('/groups/$groupId', data: data.toJson());
      return ChatGroup.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<void> deleteGroup(String groupId) async {
    try {
      await ApiClient.delete('/groups/$groupId');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<List<ChatMessage>> getGroupMessages(String groupId) async {
    try {
      final response = await ApiClient.get('/groups/$groupId/messages');
      final messages = (response.data['data'] as List)
          .map((json) => ChatMessage.fromJson(json))
          .toList();
      return messages;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<List<GroupMember>> getGroupMembers(String groupId) async {
    try {
      final response = await ApiClient.get('/groups/$groupId/members');
      final members = (response.data['data'] as List)
          .map((json) => GroupMember.fromJson(json))
          .toList();
      return members;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<GroupMember> addGroupMember(
      String groupId, String username) async {
    try {
      final response = await ApiClient.post(
        '/groups/$groupId/members',
        data: {'username': username},
      );
      return GroupMember.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<void> removeGroupMember(String groupId, String username) async {
    try {
      await ApiClient.delete('/groups/$groupId/members/$username');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<GroupMember> updateGroupMemberRole(
      String groupId, String username, String role) async {
    try {
      final response = await ApiClient.put(
        '/groups/$groupId/members/$username/role',
        data: {'role': role},
      );
      return GroupMember.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // Discussions
  static Future<List<Discussion>> getDiscussions() async {
    try {
      final response = await ApiClient.get('/discussions');
      final discussions = (response.data['discussions'] as List)
          .map((json) => Discussion.fromJson(json))
          .toList();
      return discussions;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<DiscussionWithReplies> getDiscussion(String id) async {
    try {
      final response = await ApiClient.get('/discussions/$id');
      return DiscussionWithReplies.fromJson(response.data['discussion']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<Discussion> createDiscussion(DiscussionCreate data) async {
    try {
      final response =
          await ApiClient.post('/discussions', data: data.toJson());
      return Discussion.fromJson(response.data['discussion']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<DiscussionReply> addDiscussionReply(
      String discussionId, DiscussionReplyCreate data) async {
    try {
      final response = await ApiClient.post(
        '/discussions/$discussionId/replies',
        data: data.toJson(),
      );
      return DiscussionReply.fromJson(response.data['reply']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<void> deleteDiscussion(String id) async {
    try {
      await ApiClient.delete('/discussions/$id');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // Anonymous Chat
  static Future<List<AnonymousMessage>> getAnonymousMessages() async {
    try {
      final response = await ApiClient.get('/anonymous/messages');
      final messages = (response.data['messages'] as List)
          .map((json) => AnonymousMessage.fromJson(json))
          .toList();
      return messages;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<AnonymousMessage> sendAnonymousMessage(
      AnonymousMessageCreate data) async {
    try {
      final response =
          await ApiClient.post('/anonymous/messages', data: data.toJson());
      return AnonymousMessage.fromJson(response.data['message']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  static Future<void> deleteAnonymousMessages() async {
    try {
      await ApiClient.delete('/anonymous/messages');
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
