/**
 * @file Root aplikasi yang sekarang menggunakan routing untuk memisahkan landing dan dashboard
 */
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Loading component for Suspense fallback
const PageLoader: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
        </div>
    </div>
);

// Lazy load all pages for better initial bundle size
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ArticlesPage = lazy(() => import('./pages/ArticlesPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DashboardTasksPage = lazy(() => import('./pages/DashboardTasksPage'));
const DashboardChatPage = lazy(() => import('./pages/DashboardChatPage'));
const DashboardUsersPage = lazy(() => import('./pages/DashboardUsersPage'));
const DashboardArticlesPage = lazy(() => import('./pages/DashboardArticlesPage'));
const ArticleCreatePage = lazy(() => import('./pages/ArticleCreatePage'));
const ArticleEditPage = lazy(() => import('./pages/ArticleEditPage'));
const DashboardRoomsPage = lazy(() => import('./pages/DashboardRoomsPage'));
const DashboardBookingsPage = lazy(() => import('./pages/DashboardBookingsPage'));
const DashboardRoomFormPage = lazy(() => import('./pages/DashboardRoomFormPage'));
const DashboardBookingFormPage = lazy(() => import('./pages/DashboardBookingFormPage'));
const DashboardBookingDetailPage = lazy(() => import('./pages/DashboardBookingDetailPage'));
const DashboardRoomDetailPage = lazy(() => import('./pages/DashboardRoomDetailPage'));
const DashboardFormsPage = lazy(() => import('./pages/DashboardFormsPage'));
const DashboardFormEditorPage = lazy(() => import('./pages/DashboardFormEditorPage'));
const DashboardFormResponsesPage = lazy(() => import('./pages/DashboardFormResponsesPage'));
const DashboardFormResponseDetailPage = lazy(() => import('./pages/DashboardFormResponseDetailPage'));
const DashboardItemsPage = lazy(() => import('./pages/DashboardItemsPage'));
const DashboardItemBorrowingsPage = lazy(() => import('./pages/DashboardItemBorrowingsPage'));
const FormFillPage = lazy(() => import('./pages/FormFillPage'));
const DiscussionForumPage = lazy(() => import('./pages/DiscussionForumPage'));
const DiscussionDetailPage = lazy(() => import('./pages/DiscussionDetailPage'));
const DashboardTicketsPage = lazy(() => import('./pages/DashboardTicketsPage'));
const DashboardTicketDetailPage = lazy(() => import('./pages/DashboardTicketDetailPage'));
const DashboardEventsPage = lazy(() => import('./pages/DashboardEventsPage'));
const DashboardEventFormPage = lazy(() => import('./pages/DashboardEventFormPage'));
const DashboardEventDetailPage = lazy(() => import('./pages/DashboardEventDetailPage'));
const DashboardEventScanPage = lazy(() => import('./pages/DashboardEventScanPage'));
const DashboardEventScanHistoryPage = lazy(() => import('./pages/DashboardEventScanHistoryPage'));
const FullscreenAnonymousChatPage = lazy(() => import('./pages/FullscreenAnonymousChatPage'));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30000, // 30 seconds - reduce unnecessary refetches
        },
    },
});

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/articles" element={<ArticlesPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/form/:token" element={<FormFillPage />} />
                            <Route path="/discussions" element={<DiscussionForumPage />} />
                            <Route path="/discussions/:discussionId" element={<DiscussionDetailPage />} />
                            <Route path="/fullscreen-chat" element={<FullscreenAnonymousChatPage />} />
                            <Route path="/dashboard" element={<DashboardPage />}>
                                <Route index element={<Navigate to="/dashboard/tasks" replace />} />
                                <Route path="tasks" element={<DashboardTasksPage />} />
                                <Route path="chat" element={<DashboardChatPage />} />
                                <Route
                                    path="users"
                                    element={
                                        <ProtectedRoute requireAdmin>
                                            <DashboardUsersPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="articles">
                                    <Route index element={<DashboardArticlesPage />} />
                                    <Route path="new" element={<ArticleCreatePage />} />
                                    <Route path=":slug/edit" element={<ArticleEditPage />} />
                                </Route>
                                <Route
                                    path="rooms"
                                    element={
                                        <ProtectedRoute>
                                            <DashboardRoomsPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="rooms/:roomId"
                                    element={
                                        <ProtectedRoute>
                                            <DashboardRoomDetailPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="rooms/new"
                                    element={
                                        <ProtectedRoute requireAdmin>
                                            <DashboardRoomFormPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="rooms/:roomId/edit"
                                    element={
                                        <ProtectedRoute requireAdmin>
                                            <DashboardRoomFormPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="bookings" element={<DashboardBookingsPage />} />
                                <Route path="bookings/new" element={<DashboardBookingFormPage />} />
                                <Route path="bookings/:bookingId" element={<DashboardBookingDetailPage />} />
                                <Route path="forms" element={<DashboardFormsPage />} />
                                <Route path="forms/new" element={<DashboardFormEditorPage />} />
                                <Route path="forms/:formId/edit" element={<DashboardFormEditorPage />} />
                                <Route path="forms/:formId/responses" element={<DashboardFormResponsesPage />} />
                                <Route path="forms/:formId/responses/:responseId" element={<DashboardFormResponseDetailPage />} />
                                <Route path="items" element={<DashboardItemsPage />} />
                                <Route path="item-borrowings" element={<DashboardItemBorrowingsPage />} />
                                <Route path="tickets" element={<DashboardTicketsPage />} />
                                <Route path="tickets/:ticketId" element={<DashboardTicketDetailPage />} />
                                <Route path="events" element={<DashboardEventsPage />} />
                                <Route path="events/new" element={<DashboardEventFormPage />} />
                                <Route path="events/:eventId" element={<DashboardEventDetailPage />} />
                                <Route path="events/:eventId/edit" element={<DashboardEventFormPage />} />
                                <Route path="events/:eventId/scan" element={<DashboardEventScanPage />} />
                                <Route path="events/:eventId/history" element={<DashboardEventScanHistoryPage />} />
                            </Route>
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </QueryClientProvider>
        </ThemeProvider>
    );
};

export default App;