# Atiohaidar Portfolio Application APLIKASI MODAL PENASARAN KWKWKWK. ini full bisa berapa bulan dikerjain? coba cek git history nya update fiturnya berapa menit sekali

A full-stack portfolio and management application with web and mobile support.



## 🚀 Quick Start

### For Developers

**New to the project?** Start with the [Maintenance Guide](MAINTENANCE.md) for complete setup and development instructions.

### Running the Application

```bash
# Backend (Cloudflare Workers)
cd backend
npm install
npm run dev

# Frontend (React Web App)
cd frontend
npm install
npm run dev

# Mobile App (Expo)
cd expojs
npm install
npx expo start
```

## 📚 Documentation

### Essential Guides
- **[MAINTENANCE.md](MAINTENANCE.md)** - Complete maintenance and development guide 👈 START HERE
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture and design patterns
- **[docs/README.md](docs/README.md)** - Documentation index
- **[docs/IEEE_PAPER.md](docs/IEEE_PAPER.md)** - Academic paper (IEEE style): research questions, SOTA, methods & conclusion

### Feature-Specific
- [Chat System Documentation](CHAT_DOCUMENTATION.md)
- [Mobile App Guide](expojs/MOBILE_APP_GUIDE.md)
- [Dashboard Guide](frontend/DASHBOARD_GUIDE.md)

## 🏗️ Project Structure

```
atiohaidar.github.io/
├── backend/           # Cloudflare Workers API (TypeScript)
│   ├── src/
│   │   ├── common/   # Shared utilities & base classes
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── routes/
│   └── migrations/   # Database schemas
│
├── frontend/         # React web application (Vite)
│   ├── lib/
│   │   └── api/     # Consolidated API client
│   ├── components/
│   │   └── ui/      # Reusable UI components
│   ├── hooks/       # Custom React hooks
│   ├── pages/
│   └── utils/
│
└── expojs/          # React Native mobile app (Expo)
    ├── app/         # File-based routing
    ├── screens/
    ├── components/
    └── services/
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Cloudflare Workers (Edge Computing)
- **Language**: TypeScript
- **Framework**: Hono + Chanfana (OpenAPI)
- **Database**: Cloudflare D1 (SQLite)

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **State**: React Query

### Mobile
- **Framework**: React Native + Expo
- **Styling**: NativeWind
- **Navigation**: Expo Router

## 🎯 Key Features

- 📝 Task Management
- 📰 Blog/Articles System
- 🏢 Room Booking
- 💬 Chat System (Private & Group)
- 👥 User Management
- 📊 Dashboard Analytics
- 🌓 Dark/Light Theme
- 📱 Mobile App Support

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account (for backend deployment)
- Expo account (for mobile deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/atiohaidar/atiohaidar.github.io.git
cd atiohaidar.github.io

# Install dependencies for all projects
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd expojs && npm install && cd ..
```

### Environment Variables

```bash
# Backend - backend/wrangler.jsonc
# Configure Cloudflare D1 database binding

# Frontend - frontend/.env.development
VITE_API_URL=http://localhost:8787

# Frontend - frontend/.env.production
VITE_API_URL=https://backend.atiohaidar.workers.dev

# Mobile - expojs/.env (optional)
EXPO_PUBLIC_API_BASE_URL=https://backend.atiohaidar.workers.dev
```

## 📦 Building & Deployment

### Backend
```bash
cd backend
npm run deploy  # Deploy to Cloudflare Workers
```

### Frontend
```bash
cd frontend
npm run build   # Build for production
# Deploy via GitHub Pages (automatic on push to main)
```

### Mobile
```bash
cd expojs
eas build --platform android  # Build for Android
eas build --platform ios       # Build for iOS
```

## 🧪 Testing

```bash
# Backend
cd backend
npm run dev  # Test locally with wrangler

# Frontend
cd frontend
npm run dev     # Development server
npm run build   # Test production build

# Mobile
cd expojs
npx expo start  # Start Expo dev server
```

## 📖 Code Organization Principles

This project follows **DRY (Don't Repeat Yourself)** principles:

### Backend
- ✅ Base controller class for common patterns
- ✅ Shared response schemas
- ✅ Service layer for business logic

### Frontend
- ✅ Consolidated API client (`lib/api/`)
- ✅ Reusable hooks (`hooks/`)
- ✅ UI component library (`components/ui/`)
- ✅ Backwards compatibility maintained

### Mobile
- ✅ Singleton API service
- ✅ File-based routing
- ✅ Shared components

## 🤝 Contributing

1. Follow existing code patterns
2. Apply DRY principles
3. Update documentation
4. Test across all platforms
5. Maintain backwards compatibility

See [MAINTENANCE.md](MAINTENANCE.md) for detailed guidelines.

## 🐛 Troubleshooting

Common issues and solutions are documented in:
- [MAINTENANCE.md - Troubleshooting](MAINTENANCE.md#troubleshooting)

Quick tips:
- Clear `node_modules` and reinstall if builds fail
- Check environment variables are set correctly
- Ensure all services are running on correct ports
- Review console/logs for detailed error messages

## 📄 License

[Add your license here]

## 👤 Author

**Atio Haidar Hanif**

- GitHub: [@atiohaidar](https://github.com/atiohaidar)
- Website: https://atiohaidar.github.io

## 🌟 Acknowledgments

- Cloudflare Workers for serverless computing
- React and React Native communities
- Expo for mobile development tools

---

For detailed documentation, see [MAINTENANCE.md](MAINTENANCE.md) and [docs/](docs/).
