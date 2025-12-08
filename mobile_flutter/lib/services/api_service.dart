import 'package:dio/dio.dart';
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
      final response = await ApiClient.put('/users/$username', data: data.toJson());
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

  // Tasks
  static Future<List<Task>> getTasks({int? page, bool? isCompleted}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (page != null) queryParams['page'] = page;
      if (isCompleted != null) queryParams['is_completed'] = isCompleted;
      
      final response = await ApiClient.get('/tasks', queryParameters: queryParams);
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
      final response = await ApiClient.put('/articles/$slug', data: data.toJson());
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

  static Future<Booking> updateBookingStatus(String id, BookingUpdate data) async {
    try {
      final response = await ApiClient.put('/bookings/$id', data: data.toJson());
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

  // Tickets
  static Future<List<Ticket>> getTickets({String? status}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (status != null) queryParams['status'] = status;
      
      final response = await ApiClient.get('/tickets', queryParameters: queryParams);
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

  static Future<TicketStats> getTicketStats() async {
    try {
      final response = await ApiClient.get('/tickets/stats');
      return TicketStats.fromJson(response.data['data']);
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

  static Future<ItemBorrowing> createItemBorrowing(ItemBorrowingCreate data) async {
    try {
      final response = await ApiClient.post('/item-borrowings', data: data.toJson());
      return ItemBorrowing.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
