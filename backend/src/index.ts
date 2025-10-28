import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { AuthLogin } from "./endpoints/authLogin";
import { UsersCreate } from "./endpoints/usersCreate";
import { UsersDelete } from "./endpoints/usersDelete";
import { UsersList } from "./endpoints/usersList";
import { UsersUpdate } from "./endpoints/usersUpdate";
import { TaskCreate } from "./endpoints/taskCreate";
import { TaskDelete } from "./endpoints/taskDelete";
import { TaskFetch } from "./endpoints/taskFetch";
import { TaskList } from "./endpoints/taskList";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

app.use(
	"*",
	cors({
		origin: "*",
		allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
	}),
);

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Register OpenAPI endpoints
openapi.post("/api/auth/login", AuthLogin);
openapi.get("/api/users", UsersList);
openapi.post("/api/users", UsersCreate);
openapi.put("/api/users/:username", UsersUpdate);
openapi.delete("/api/users/:username", UsersDelete);
openapi.get("/api/tasks", TaskList);
openapi.post("/api/tasks", TaskCreate);
openapi.get("/api/tasks/:taskSlug", TaskFetch);
openapi.delete("/api/tasks/:taskSlug", TaskDelete);

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app;
