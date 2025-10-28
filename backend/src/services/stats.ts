import { D1Database } from "@cloudflare/workers-types";

export interface DashboardStats {
	totalUsers: number;
	totalTasks: number;
	completedTasks: number;
	totalArticles: number;
	publishedArticles: number;
	totalRooms: number;
	totalBookings: number;
	pendingBookings: number;
	approvedBookings: number;
}

/**
 * Get dashboard statistics for admin
 */
export const getAdminStats = async (db: D1Database): Promise<DashboardStats> => {
	const [
		usersResult,
		tasksResult,
		completedTasksResult,
		articlesResult,
		publishedArticlesResult,
		roomsResult,
		bookingsResult,
		pendingBookingsResult,
		approvedBookingsResult,
	] = await Promise.all([
		db.prepare("SELECT COUNT(*) as count FROM users").first(),
		db.prepare("SELECT COUNT(*) as count FROM tasks").first(),
		db.prepare("SELECT COUNT(*) as count FROM tasks WHERE completed = 1").first(),
		db.prepare("SELECT COUNT(*) as count FROM articles").first(),
		db.prepare("SELECT COUNT(*) as count FROM articles WHERE published = 1").first(),
		db.prepare("SELECT COUNT(*) as count FROM rooms").first(),
		db.prepare("SELECT COUNT(*) as count FROM bookings").first(),
		db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'").first(),
		db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'approved'").first(),
	]);

	return {
		totalUsers: (usersResult?.count as number) ?? 0,
		totalTasks: (tasksResult?.count as number) ?? 0,
		completedTasks: (completedTasksResult?.count as number) ?? 0,
		totalArticles: (articlesResult?.count as number) ?? 0,
		publishedArticles: (publishedArticlesResult?.count as number) ?? 0,
		totalRooms: (roomsResult?.count as number) ?? 0,
		totalBookings: (bookingsResult?.count as number) ?? 0,
		pendingBookings: (pendingBookingsResult?.count as number) ?? 0,
		approvedBookings: (approvedBookingsResult?.count as number) ?? 0,
	};
};

/**
 * Get dashboard statistics for member (only their own data)
 */
export const getMemberStats = async (
	db: D1Database,
	username: string,
): Promise<Omit<DashboardStats, "totalUsers" | "totalRooms">> => {
	const [
		tasksResult,
		completedTasksResult,
		articlesResult,
		publishedArticlesResult,
		bookingsResult,
		pendingBookingsResult,
		approvedBookingsResult,
	] = await Promise.all([
		db.prepare("SELECT COUNT(*) as count FROM tasks WHERE owner = ?").bind(username).first(),
		db
			.prepare("SELECT COUNT(*) as count FROM tasks WHERE owner = ? AND completed = 1")
			.bind(username)
			.first(),
		db.prepare("SELECT COUNT(*) as count FROM articles WHERE owner = ?").bind(username).first(),
		db
			.prepare("SELECT COUNT(*) as count FROM articles WHERE owner = ? AND published = 1")
			.bind(username)
			.first(),
		db
			.prepare("SELECT COUNT(*) as count FROM bookings WHERE user_username = ?")
			.bind(username)
			.first(),
		db
			.prepare("SELECT COUNT(*) as count FROM bookings WHERE user_username = ? AND status = 'pending'")
			.bind(username)
			.first(),
		db
			.prepare("SELECT COUNT(*) as count FROM bookings WHERE user_username = ? AND status = 'approved'")
			.bind(username)
			.first(),
	]);

	return {
		totalTasks: (tasksResult?.count as number) ?? 0,
		completedTasks: (completedTasksResult?.count as number) ?? 0,
		totalArticles: (articlesResult?.count as number) ?? 0,
		publishedArticles: (publishedArticlesResult?.count as number) ?? 0,
		totalBookings: (bookingsResult?.count as number) ?? 0,
		pendingBookings: (pendingBookingsResult?.count as number) ?? 0,
		approvedBookings: (approvedBookingsResult?.count as number) ?? 0,
	};
};
