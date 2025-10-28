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
	BookingCancel,
} from "../controllers/booking.controller";

export const registerRoutes = (openapi: any) => {
	// Auth routes
	openapi.post("/api/auth/login", AuthLogin);

	// User routes
	openapi.get("/api/users", UserController.list, { schema: UserController.listSchema });
	openapi.post("/api/users", UserController.create, { schema: UserController.createSchema });
	openapi.get("/api/users/:username", UserController.get, { schema: UserController.getSchema });
	openapi.put("/api/users/:username", UserController.update, { schema: UserController.updateSchema });
	openapi.delete("/api/users/:username", UserController.delete, { schema: UserController.deleteSchema });

	// Task routes
	openapi.get("/api/tasks", TaskController.list, { schema: TaskController.listSchema });
	openapi.post("/api/tasks", TaskController.create, { schema: TaskController.createSchema });
	openapi.get("/api/tasks/:taskSlug", TaskController.get, { schema: TaskController.getSchema });
	openapi.put("/api/tasks/:taskSlug", TaskController.update, { schema: TaskController.updateSchema });
	openapi.delete("/api/tasks/:taskSlug", TaskController.delete, { schema: TaskController.deleteSchema });

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
	openapi.delete("/api/bookings/:bookingId", BookingCancel);
};
