import { AuthApiService } from './auth';
import { StatsApiService } from './stats';
import { UsersApiService } from './users';
import { TasksApiService } from './tasks';
import { ArticlesApiService } from './articles';
import { RoomsApiService } from './rooms';
import { BookingsApiService } from './bookings';
import { ChatApiService } from './chat';
import { NotificationsApiService } from './notifications';
import { WalletApiService } from './wallet';
import { TicketsApiService } from './tickets';
import { ItemsApiService } from './items';
import { FormsApiService } from './forms';
import { EventsApiService } from './events';
import { DiscussionsApiService } from './discussions';
import { ItemBorrowingsApiService } from './item-borrowings';

// Re-export specific services if needed
export * from './base';
export * from './auth';
export * from './stats';
export * from './users';
export * from './tasks';
export * from './articles';
export * from './rooms';
export * from './bookings';
export * from './chat';
export * from './notifications';
export * from './wallet';
export * from './tickets';
export * from './items';
export * from './forms';
export * from './events';
export * from './discussions';
export * from './item-borrowings';

// Create a composite class that mixes in all methods from the specialized services
// This maintains backward compatibility with the monolithic ApiService
class UnifiedApiService {
    private auth = new AuthApiService();
    private stats = new StatsApiService();
    private users = new UsersApiService();
    private tasks = new TasksApiService();
    private articles = new ArticlesApiService();
    private rooms = new RoomsApiService();
    private bookings = new BookingsApiService();
    private chat = new ChatApiService();
    private notifications = new NotificationsApiService();
    private wallet = new WalletApiService();
    private tickets = new TicketsApiService();
    private items = new ItemsApiService();
    private forms = new FormsApiService();
    private events = new EventsApiService();
    private discussions = new DiscussionsApiService();
    private itemBorrowings = new ItemBorrowingsApiService();

    // Auth delegates
    login = this.auth.login.bind(this.auth);
    logout = this.auth.logout.bind(this.auth);
    register = this.auth.register.bind(this.auth);
    forgotPassword = this.auth.forgotPassword.bind(this.auth);
    getCurrentUser = this.auth.getCurrentUser.bind(this.auth);

    // Stats delegates
    getStats = this.stats.getStats.bind(this.stats);

    // Users delegates
    listUsers = this.users.listUsers.bind(this.users);
    getUser = this.users.getUser.bind(this.users);
    createUser = this.users.createUser.bind(this.users);
    updateUser = this.users.updateUser.bind(this.users);
    updateSelfProfile = this.users.updateSelfProfile.bind(this.users);
    deleteUser = this.users.deleteUser.bind(this.users);

    // Tasks delegates
    listTasks = this.tasks.listTasks.bind(this.tasks);
    getTask = this.tasks.getTask.bind(this.tasks);
    createTask = this.tasks.createTask.bind(this.tasks);
    updateTask = this.tasks.updateTask.bind(this.tasks);
    deleteTask = this.tasks.deleteTask.bind(this.tasks);

    // Articles delegates
    listArticles = this.articles.listArticles.bind(this.articles);
    listPublicArticles = this.articles.listPublicArticles.bind(this.articles);
    getPublicArticle = this.articles.getPublicArticle.bind(this.articles);
    getArticle = this.articles.getArticle.bind(this.articles);
    createArticle = this.articles.createArticle.bind(this.articles);
    updateArticle = this.articles.updateArticle.bind(this.articles);
    deleteArticle = this.articles.deleteArticle.bind(this.articles);

    // Rooms delegates
    listRooms = this.rooms.listRooms.bind(this.rooms);
    getRoom = this.rooms.getRoom.bind(this.rooms);
    createRoom = this.rooms.createRoom.bind(this.rooms);
    updateRoom = this.rooms.updateRoom.bind(this.rooms);
    deleteRoom = this.rooms.deleteRoom.bind(this.rooms);

    // Bookings delegates
    listBookings = this.bookings.listBookings.bind(this.bookings);
    getBooking = this.bookings.getBooking.bind(this.bookings);
    createBooking = this.bookings.createBooking.bind(this.bookings);
    updateBookingStatus = this.bookings.updateBookingStatus.bind(this.bookings);
    cancelBooking = this.bookings.cancelBooking.bind(this.bookings);

    // Chat/Groups delegates
    listConversations = this.chat.listConversations.bind(this.chat);
    getOrCreateConversation = this.chat.getOrCreateConversation.bind(this.chat);
    getConversationMessages = this.chat.getConversationMessages.bind(this.chat);
    sendMessage = this.chat.sendMessage.bind(this.chat);
    listGroups = this.chat.listGroups.bind(this.chat);
    getGroup = this.chat.getGroup.bind(this.chat);
    createGroup = this.chat.createGroup.bind(this.chat);
    updateGroup = this.chat.updateGroup.bind(this.chat);
    deleteGroup = this.chat.deleteGroup.bind(this.chat);
    getGroupMessages = this.chat.getGroupMessages.bind(this.chat);
    getGroupMembers = this.chat.getGroupMembers.bind(this.chat);
    addGroupMember = this.chat.addGroupMember.bind(this.chat);
    removeGroupMember = this.chat.removeGroupMember.bind(this.chat);
    updateGroupMemberRole = this.chat.updateGroupMemberRole.bind(this.chat);
    listAnonymousMessages = this.chat.listAnonymousMessages.bind(this.chat);
    sendAnonymousMessage = this.chat.sendAnonymousMessage.bind(this.chat);

    // Notifications delegates
    getNotifications = this.notifications.getNotifications.bind(this.notifications);
    markNotificationRead = this.notifications.markNotificationRead.bind(this.notifications);

    // Wallet delegates
    getTransactionHistory = this.wallet.getTransactionHistory.bind(this.wallet);
    transferBalance = this.wallet.transferBalance.bind(this.wallet);
    topUpBalance = this.wallet.topUpBalance.bind(this.wallet);

    // Tickets delegates
    listTickets = this.tickets.listTickets.bind(this.tickets);
    listTicketCategories = this.tickets.listTicketCategories.bind(this.tickets);
    getTicket = this.tickets.getTicket.bind(this.tickets);
    createTicket = this.tickets.createTicket.bind(this.tickets);
    updateTicket = this.tickets.updateTicket.bind(this.tickets);
    deleteTicket = this.tickets.deleteTicket.bind(this.tickets);
    createTicketComment = this.tickets.createTicketComment.bind(this.tickets);
    listTicketComments = this.tickets.listTicketComments.bind(this.tickets);
    listTicketAssignments = this.tickets.listTicketAssignments.bind(this.tickets);
    assignTicket = this.tickets.assignTicket.bind(this.tickets);

    // Items delegates
    listItems = this.items.listItems.bind(this.items);
    getItem = this.items.getItem.bind(this.items);
    createItem = this.items.createItem.bind(this.items);
    updateItem = this.items.updateItem.bind(this.items);
    deleteItem = this.items.deleteItem.bind(this.items);

    // Forms delegates
    listForms = this.forms.listForms.bind(this.forms);
    getForm = this.forms.getForm.bind(this.forms);
    getFormByToken = this.forms.getFormByToken.bind(this.forms);
    createForm = this.forms.createForm.bind(this.forms);
    updateForm = this.forms.updateForm.bind(this.forms);
    deleteForm = this.forms.deleteForm.bind(this.forms);
    listFormResponses = this.forms.listFormResponses.bind(this.forms);
    getFormResponseDetail = this.forms.getFormResponseDetail.bind(this.forms);
    submitFormResponse = this.forms.submitFormResponse.bind(this.forms);

    // Events delegates
    listEvents = this.events.listEvents.bind(this.events);
    getEvent = this.events.getEvent.bind(this.events);
    createEvent = this.events.createEvent.bind(this.events);
    updateEvent = this.events.updateEvent.bind(this.events);
    deleteEvent = this.events.deleteEvent.bind(this.events);
    listEventAttendees = this.events.listEventAttendees.bind(this.events);
    registerForEvent = this.events.registerForEvent.bind(this.events);
    unregisterFromEvent = this.events.unregisterFromEvent.bind(this.events);
    updateAttendeeStatus = this.events.updateAttendeeStatus.bind(this.events);
    listEventAdmins = this.events.listEventAdmins.bind(this.events);
    addEventAdmin = this.events.addEventAdmin.bind(this.events);
    removeEventAdmin = this.events.removeEventAdmin.bind(this.events);
    scanAttendance = this.events.scanAttendance.bind(this.events);
    getEventScanHistory = this.events.getEventScanHistory.bind(this.events);

    // Discussions delegates
    listDiscussions = this.discussions.listDiscussions.bind(this.discussions);
    getDiscussion = this.discussions.getDiscussion.bind(this.discussions);
    createDiscussion = this.discussions.createDiscussion.bind(this.discussions);
    deleteDiscussion = this.discussions.deleteDiscussion.bind(this.discussions);
    createDiscussionReply = this.discussions.createDiscussionReply.bind(this.discussions);

    // Item Borrowings delegates
    listItemBorrowings = this.itemBorrowings.listItemBorrowings.bind(this.itemBorrowings);
    getItemBorrowing = this.itemBorrowings.getItemBorrowing.bind(this.itemBorrowings);
    createItemBorrowing = this.itemBorrowings.createItemBorrowing.bind(this.itemBorrowings);
    updateItemBorrowingStatus = this.itemBorrowings.updateItemBorrowingStatus.bind(this.itemBorrowings);
    cancelItemBorrowing = this.itemBorrowings.cancelItemBorrowing.bind(this.itemBorrowings);
    deleteItemBorrowing = this.itemBorrowings.deleteItemBorrowing.bind(this.itemBorrowings);
}

// Export default singleton to replace the original ApiService default export
const apiService = new UnifiedApiService();
export default apiService;
