import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { registerRoutes } from "./routes";
import { ChatRoom } from "./durable-objects/ChatRoom";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

app.use(
	"*",
	cors({
		origin: "*",
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
	}),
);

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Register all API routes
registerRoutes(openapi);

// Export the Hono app
export default {
	async fetch(request: Request, env: Bindings): Promise<Response> {
		const url = new URL(request.url);

		// Handle WebSocket connections
		if (url.pathname === '/chat') {
			const id = env.CHAT_ROOM.idFromName('anonymous-chat-room');
			const obj = env.CHAT_ROOM.get(id);
			return obj.fetch(request);
		}

		// Handle regular HTTP requests with Hono
		return app.fetch(request, env);
	},
};

// Export Durable Objects
export { ChatRoom };
