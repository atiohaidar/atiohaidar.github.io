import { AuthLogin } from "../controllers/authLogin";
import { UsersCreate } from "../controllers/usersCreate";
import { UsersDelete } from "../controllers/usersDelete";
import { UsersList } from "../controllers/usersList";
import { UsersUpdate } from "../controllers/usersUpdate";
import { TaskCreate } from "../controllers/taskCreate";
import { TaskDelete } from "../controllers/taskDelete";
import { TaskFetch } from "../controllers/taskFetch";
import { TaskList } from "../controllers/taskList";

export const registerRoutes = (openapi: any) => {
	// Auth routes
	openapi.post("/api/auth/login", AuthLogin);

	// User routes
	openapi.get("/api/users", UsersList);
	openapi.post("/api/users", UsersCreate);
	openapi.put("/api/users/:username", UsersUpdate);
	openapi.delete("/api/users/:username", UsersDelete);

	// Task routes
	openapi.get("/api/tasks", TaskList);
	openapi.post("/api/tasks", TaskCreate);
	openapi.get("/api/tasks/:taskSlug", TaskFetch);
	openapi.delete("/api/tasks/:taskSlug", TaskDelete);
};
