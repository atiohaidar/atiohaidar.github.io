import { AuthLogin } from "../controllers/authLogin";
import { UserController } from "../controllers/user.controller";
import { TaskController } from "../controllers/task.controller";
import { 
	ArticleList, 
	ArticleGet, 
	ArticleCreate, 
	ArticleUpdate, 
	ArticleDelete 
} from "../controllers/article.controller";
import {
	RoomList,
	RoomGet,
	RoomCreate,
	RoomUpdate,
	RoomDelete,
} from "../controllers/room.controller";
import {
	BookingList,
	BookingGet,
	BookingCreate,
	BookingUpdateStatus,
	BookingUpdate,
	BookingCancel,
} from "../controllers/booking.controller";
import { StatsGet } from "../controllers/stats.controller";
import {
	ConversationList,
	ConversationGetOrCreate,
	ConversationMessages,
	MessageSend,
	GroupList,
	GroupCreate,
	GroupGet,
	GroupUpdate,
	GroupDelete,
	GroupMessages,
	GroupMembers,
	GroupAddMember,
	GroupRemoveMember,
	GroupUpdateMemberRole,
} from "../controllers/chat.controller";
import {
	AnonymousMessageList,
	AnonymousMessageSend,
	AnonymousMessageDeleteAll,
} from "../controllers/anonymousChat.controller";
import {
	PublicArticleList,
	PublicArticleGet,
} from "../controllers/publicArticle.controller";
import {
	FormList,
	FormGet,
	FormGetByToken,
	FormCreate,
	FormUpdate,
	FormDelete,
	FormResponseSubmit,
	FormResponseList,
	FormResponseGet,
} from "../controllers/form.controller";
import {
	ItemList,
	ItemGet,
	ItemCreate,
	ItemUpdate,
	ItemDelete,
} from "../controllers/item.controller";
import {
	ItemBorrowingList,
	ItemBorrowingGet,
	ItemBorrowingCreate,
	ItemBorrowingUpdateStatus,
	ItemBorrowingCancel,
} from "../controllers/itemBorrowing.controller";
import {
	DiscussionList,
	DiscussionGet,
	DiscussionCreate,
	DiscussionReplyCreate,
	DiscussionDelete,
} from "../controllers/discussion.controller";
import {
	CategoryList,
	TicketList,
	TicketGet,
	TicketUpdate,
	TicketDelete,
	TicketCommentList,
	TicketCommentCreate,
	TicketAssignmentList,
	TicketAssign,
	TicketStatsGet,
	PublicTicketCreate,
	PublicTicketGetByToken,
	PublicTicketCommentCreate,
	PublicTicketCommentList,
} from "../controllers/ticket.controller";
import {
	EventList,
	EventGet,
	EventCreate,
	EventUpdate,
	EventDelete,
	EventAttendeeList,
	EventAttendeeRegister,
	EventAttendeeUpdateStatus,
	EventAttendeeUnregister,
	EventAdminList,
	EventAdminAssign,
	EventAdminRemove,
	AttendanceScanCreate,
	AttendeeWithScansGet,
	EventScanHistoryList,
} from "../controllers/event.controller";
import {
	ListWhiteboards,
	GetWhiteboard,
	CreateWhiteboard,
	UpdateWhiteboard,
	DeleteWhiteboard,
	GetWhiteboardStrokes,
	ClearWhiteboard,
} from "../controllers/WhiteboardsController";

export const registerRoutes = (openapi: any) => {
	// Public routes (no authentication required)
	openapi.get("/api/public/articles", PublicArticleList);
	openapi.get("/api/public/articles/:slug", PublicArticleGet);

	// Auth routes
	openapi.post("/api/auth/login", AuthLogin);

	// Stats routes
	openapi.get("/api/stats", StatsGet);

	// User routes
	openapi.get("/api/users", UserController.list, { schema: UserController.listSchema });
	openapi.post("/api/users", UserController.create, { schema: UserController.createSchema });
	openapi.get("/api/users/:username", UserController.get, { schema: UserController.getSchema });
	openapi.put("/api/users/:username", UserController.update, { schema: UserController.updateSchema });
	openapi.delete("/api/users/:username", UserController.delete, { schema: UserController.deleteSchema });
	
	// Self-profile update route (for authenticated users)
	openapi.put("/api/profile", UserController.updateSelfProfile, { schema: UserController.updateSelfProfileSchema });

	// Task routes
	openapi.get("/api/tasks", TaskController.list, { schema: TaskController.listSchema });
	openapi.post("/api/tasks", TaskController.create, { schema: TaskController.createSchema });
	openapi.get("/api/tasks/:taskId", TaskController.get, { schema: TaskController.getSchema });
	openapi.put("/api/tasks/:taskId", TaskController.update, { schema: TaskController.updateSchema });
	openapi.delete("/api/tasks/:taskId", TaskController.delete, { schema: TaskController.deleteSchema });

	// Article routes
	openapi.get("/api/articles", ArticleList);
	openapi.post("/api/articles", ArticleCreate);
	openapi.get("/api/articles/:slug", ArticleGet);
	openapi.put("/api/articles/:slug", ArticleUpdate);
	openapi.delete("/api/articles/:slug", ArticleDelete);

	// Room routes
	openapi.get("/api/rooms", RoomList);
	openapi.post("/api/rooms", RoomCreate);
	openapi.get("/api/rooms/:roomId", RoomGet);
	openapi.put("/api/rooms/:roomId", RoomUpdate);
	openapi.delete("/api/rooms/:roomId", RoomDelete);

	// Booking routes
	openapi.get("/api/bookings", BookingList);
	openapi.post("/api/bookings", BookingCreate);
	openapi.get("/api/bookings/:bookingId", BookingGet);
	openapi.put("/api/bookings/:bookingId", BookingUpdateStatus);
	openapi.put("/api/bookings/:bookingId/edit", BookingUpdate);
	openapi.delete("/api/bookings/:bookingId", BookingCancel);

	// Chat routes
	openapi.get("/api/conversations", ConversationList);
	openapi.get("/api/conversations/:username", ConversationGetOrCreate);
	openapi.get("/api/conversations/:conversationId/messages", ConversationMessages);
	openapi.post("/api/messages", MessageSend);

	// Group chat routes
	openapi.get("/api/groups", GroupList);
	openapi.post("/api/groups", GroupCreate);
	openapi.get("/api/groups/:groupId", GroupGet);
	openapi.put("/api/groups/:groupId", GroupUpdate);
	openapi.delete("/api/groups/:groupId", GroupDelete);
	openapi.get("/api/groups/:groupId/messages", GroupMessages);
	openapi.get("/api/groups/:groupId/members", GroupMembers);
	openapi.post("/api/groups/:groupId/members", GroupAddMember);
	openapi.delete("/api/groups/:groupId/members/:username", GroupRemoveMember);
	openapi.put("/api/groups/:groupId/members/:username/role", GroupUpdateMemberRole);

	// Anonymous chat routes
	openapi.get("/api/anonymous/messages", AnonymousMessageList);
	openapi.post("/api/anonymous/messages", AnonymousMessageSend);
	openapi.delete("/api/anonymous/messages", AnonymousMessageDeleteAll);

	// Form routes
	openapi.get("/api/forms", FormList);
	openapi.post("/api/forms", FormCreate);
	openapi.get("/api/forms/:formId", FormGet);
	openapi.put("/api/forms/:formId", FormUpdate);
	openapi.delete("/api/forms/:formId", FormDelete);
	openapi.get("/api/forms/:formId/responses", FormResponseList);
	openapi.get("/api/forms/:formId/responses/:responseId", FormResponseGet);

	// Public form routes (no authentication required)
	openapi.get("/api/public/forms/:token", FormGetByToken);
	openapi.post("/api/public/forms/:token/submit", FormResponseSubmit);

	// Item routes
	openapi.get("/api/items", ItemList);
	openapi.post("/api/items", ItemCreate);
	openapi.get("/api/items/:itemId", ItemGet);
	openapi.put("/api/items/:itemId", ItemUpdate);
	openapi.delete("/api/items/:itemId", ItemDelete);

	// Item borrowing routes
	openapi.get("/api/item-borrowings", ItemBorrowingList);
	openapi.post("/api/item-borrowings", ItemBorrowingCreate);
	openapi.get("/api/item-borrowings/:borrowingId", ItemBorrowingGet);
	openapi.put("/api/item-borrowings/:borrowingId/status", ItemBorrowingUpdateStatus);
	openapi.delete("/api/item-borrowings/:borrowingId", ItemBorrowingCancel);

	// Discussion forum routes (public access, authentication optional)
	openapi.get("/api/discussions", DiscussionList);
	openapi.post("/api/discussions", DiscussionCreate);
	openapi.get("/api/discussions/:discussionId", DiscussionGet);
	openapi.post("/api/discussions/:discussionId/replies", DiscussionReplyCreate);
	openapi.delete("/api/discussions/:discussionId", DiscussionDelete);

	// Public ticket routes (no authentication required)
	openapi.post("/api/public/tickets", PublicTicketCreate.handle);
	openapi.get("/api/public/tickets/:token", PublicTicketGetByToken.handle);
	openapi.get("/api/public/tickets/:token/comments", PublicTicketCommentList.handle);
	openapi.post("/api/public/tickets/:token/comments", PublicTicketCommentCreate.handle);

	// Ticket routes (authenticated)
	openapi.get("/api/tickets/categories", CategoryList.handle);
	openapi.get("/api/tickets", TicketList.handle);
	openapi.get("/api/tickets/stats", TicketStatsGet.handle);
	openapi.get("/api/tickets/:ticketId", TicketGet.handle);
	openapi.put("/api/tickets/:ticketId", TicketUpdate.handle);
	openapi.delete("/api/tickets/:ticketId", TicketDelete.handle);
	openapi.get("/api/tickets/:ticketId/comments", TicketCommentList.handle);
	openapi.post("/api/tickets/:ticketId/comments", TicketCommentCreate.handle);
	openapi.get("/api/tickets/:ticketId/assignments", TicketAssignmentList.handle);
	openapi.post("/api/tickets/:ticketId/assign", TicketAssign.handle);

	// Event routes
	openapi.get("/api/events", EventList);
	openapi.post("/api/events", EventCreate);
	openapi.get("/api/events/:eventId", EventGet);
	openapi.put("/api/events/:eventId", EventUpdate);
	openapi.delete("/api/events/:eventId", EventDelete);
	
	// Event attendee routes
	openapi.get("/api/events/:eventId/attendees", EventAttendeeList);
	openapi.post("/api/events/register", EventAttendeeRegister);
	openapi.put("/api/events/:eventId/attendees/:attendeeId/status", EventAttendeeUpdateStatus);
	openapi.delete("/api/events/:eventId/attendees/:attendeeId", EventAttendeeUnregister);
	openapi.get("/api/events/:eventId/attendees/:attendeeId/scans", AttendeeWithScansGet);
	
	// Event admin routes
	openapi.get("/api/events/:eventId/admins", EventAdminList);
	openapi.post("/api/events/:eventId/admins", EventAdminAssign);
	openapi.delete("/api/events/:eventId/admins/:username", EventAdminRemove);
	
	// Attendance scan routes
	openapi.post("/api/events/:eventId/scan", AttendanceScanCreate);
	openapi.get("/api/events/:eventId/scan-history", EventScanHistoryList);

	// Whiteboard routes
	openapi.get("/api/whiteboards", ListWhiteboards);
	openapi.post("/api/whiteboards", CreateWhiteboard);
	openapi.get("/api/whiteboards/:id", GetWhiteboard);
	openapi.put("/api/whiteboards/:id", UpdateWhiteboard);
	openapi.delete("/api/whiteboards/:id", DeleteWhiteboard);
	openapi.get("/api/whiteboards/:id/strokes", GetWhiteboardStrokes);
	openapi.post("/api/whiteboards/:id/clear", ClearWhiteboard);
};
