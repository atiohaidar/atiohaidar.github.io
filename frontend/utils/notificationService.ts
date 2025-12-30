import { LocalNotifications } from '@capacitor/local-notifications';

export const notificationService = {
    async requestPermissions() {
        const result = await LocalNotifications.requestPermissions();
        return result.display;
    },

    async init() {
        // 1. Register Actions (Tombol-tombol)
        await LocalNotifications.registerActionTypes({
            types: [
                {
                    id: 'LOGIN_ACTIONS',
                    actions: [
                        {
                            id: 'view',
                            title: 'Lihat Dashboard',
                            foreground: true // Buka aplikasi saat diklik
                        },
                        {
                            id: 'dismiss',
                            title: 'Abaikan',
                            destructive: true, // Biasanya warna merah di iOS, text biasa di Android
                            foreground: false
                        }
                    ]
                }
            ]
        });

        // 2. Create Channel (Android 8.0+ butuh ini buat atur warna/suara khusus)
        await LocalNotifications.createChannel({
            id: 'default',
            name: 'General Notifications',
            description: 'General notifications for the app',
            importance: 5,
            visibility: 1,
            vibration: true,
            lights: true,
            lightColor: '#2563EB' // Warna lampu LED (jika HP support)
        });
    },

    async scheduleRichNotification(title: string, body: string, imageUrl?: string) {
        // Ensure permissions are granted
        const permStatus = await LocalNotifications.checkPermissions();

        if (permStatus.display !== 'granted') {
            const newPerm = await this.requestPermissions();
            if (newPerm !== 'granted') return;
        }

        await LocalNotifications.schedule({
            notifications: [
                {
                    title,
                    body,
                    id: Math.floor(Math.random() * 100000), // Random ID biar gak ketimpa
                    schedule: { at: new Date(Date.now() + 1000) },
                    channelId: 'default',

                    // Action Buttons
                    actionTypeId: 'LOGIN_ACTIONS',

                    // Big Picture (Attachments)
                    attachments: imageUrl ? [
                        { id: 'image', url: imageUrl }
                    ] : [],

                    // Icon Color (Android only)
                    iconColor: '#2563EB', // Blue accent color

                    extra: {
                        type: 'login_success'
                    }
                }
            ]
        });
    },

    // Keep compatibility with old calls just in case
    async scheduleSimpleNotification(title: string, body: string) {
        return this.scheduleRichNotification(title, body);
    }
};
