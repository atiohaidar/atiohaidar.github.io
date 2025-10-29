/**
 * @file Root aplikasi yang sekarang menggunakan routing untuk memisahkan landing dan dashboard
 */
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './pages/LandingPage';
import ArticlesPage from './pages/ArticlesPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DashboardTasksPage from './pages/DashboardTasksPage';
import DashboardChatPage from './pages/DashboardChatPage';
import DashboardUsersPage from './pages/DashboardUsersPage';
import DashboardArticlesPage from './pages/DashboardArticlesPage';
import ArticleCreatePage from './pages/ArticleCreatePage';
import ArticleEditPage from './pages/ArticleEditPage';
import DashboardRoomsPage from './pages/DashboardRoomsPage';
import DashboardBookingsPage from './pages/DashboardBookingsPage';
import DashboardRoomFormPage from './pages/DashboardRoomFormPage';
import DashboardBookingFormPage from './pages/DashboardBookingFormPage';
import DashboardBookingDetailPage from './pages/DashboardBookingDetailPage';
import DashboardRoomDetailPage from './pages/DashboardRoomDetailPage';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/articles" element={<ArticlesPage />} />
                        <Route path="/login" element={<LoginPage />} />
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
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </QueryClientProvider>
        </ThemeProvider>
    );
};

export default App;