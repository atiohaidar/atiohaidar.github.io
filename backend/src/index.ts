import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { registerRoutes } from "./routes";

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
export default app;
