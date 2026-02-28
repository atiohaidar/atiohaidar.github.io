# Dokumentasi Teknis

Dokumentasi teknis lengkap untuk pengembang yang bekerja pada proyek Atiohaidar Portfolio & Management Application.

## Daftar Isi

- [Arsitektur Sistem](#arsitektur-sistem)
- [Backend](#backend)
  - [Struktur Direktori](#struktur-direktori-backend)
  - [Entry Point dan Konfigurasi](#entry-point-dan-konfigurasi)
  - [Controller](#controller)
  - [Service Layer](#service-layer)
  - [Middleware](#middleware)
  - [Model dan Tipe Data](#model-dan-tipe-data)
  - [Daftar Endpoint API](#daftar-endpoint-api)
  - [Skema Database](#skema-database)
  - [WebSocket dan Durable Objects](#websocket-dan-durable-objects)
- [Frontend Web](#frontend-web)
  - [Struktur Direktori](#struktur-direktori-frontend)
  - [Routing](#routing)
  - [API Client](#api-client)
  - [Halaman](#halaman)
  - [Komponen](#komponen)
  - [Hooks](#hooks)
  - [Context Provider](#context-provider)
- [Mobile App (Expo)](#mobile-app-expo)
  - [Struktur Direktori](#struktur-direktori-mobile)
  - [Navigasi dan Routing](#navigasi-dan-routing)
  - [Screens](#screens)
  - [Services](#services)
  - [Hooks Mobile](#hooks-mobile)
- [Development Setup](#development-setup)
- [Deployment](#deployment)
- [Pola Desain](#pola-desain)

---

## Arsitektur Sistem

```
┌────────────────────────────────────────────────────┐
│                   Client Layer                      │
│                                                     │
│  ┌──────────────────┐     ┌──────────────────┐     │
│  │  Frontend Web    │     │   Mobile App     │     │
│  │  React 19 + Vite │     │ React Native +   │     │
│  │  React Router v7 │     │ Expo Router      │     │
│  └────────┬─────────┘     └────────┬─────────┘     │
│           └──────────┬─────────────┘               │
└──────────────────────┼─────────────────────────────┘
                       │ HTTPS / REST API / WebSocket
┌──────────────────────▼─────────────────────────────┐
│                  Backend Layer                       │
│  Cloudflare Workers (Hono + Chanfana)               │
│  ┌────────────┐ ┌──────────┐ ┌──────────┐         │
│  │ Controllers │ │ Services │ │ Models   │         │
│  └──────┬─────┘ └────┬─────┘ └──────────┘         │
│         └─────────────┘                             │
│  ┌───────────────────────────────┐                  │
│  │ Durable Objects (WebSocket)   │                  │
│  └───────────────────────────────┘                  │
└──────────────────────┬─────────────────────────────┘
                       │ SQL
┌──────────────────────▼─────────────────────────────┐
│                   Data Layer                        │
│              Cloudflare D1 (SQLite)                 │
└────────────────────────────────────────────────────┘
```

### Alur Request

```
User Action → Component Event Handler → API Service → HTTP Request
  → Cloudflare Worker → Middleware (Auth) → Controller → Service → Database
  → Response → Component State Update → UI Re-render
```

---

## Backend

### Struktur Direktori Backend

```
backend/
├── src/
│   ├── index.ts                  # Entry point aplikasi
│   ├── common/
│   │   ├── BaseController.ts     # Kelas dasar untuk semua controller
│   │   └── schemas.ts            # Shared response schemas
│   ├── controllers/
│   │   ├── anonymousChat.controller.ts
│   │   ├── article.controller.ts
│   │   ├── authForgotPassword.ts
│   │   ├── authLogin.ts
│   │   ├── authRegister.ts
│   │   ├── booking.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── discussion.controller.ts
│   │   ├── event.controller.ts
│   │   ├── form.controller.ts
│   │   ├── game.controller.ts
│   │   ├── gameAdmin.controller.ts
│   │   ├── item.controller.ts
│   │   ├── itemBorrowing.controller.ts
│   │   ├── publicArticle.controller.ts
│   │   ├── room.controller.ts
│   │   ├── seed.controller.ts
│   │   ├── stats.controller.ts
│   │   ├── task.controller.ts
│   │   ├── ticket.controller.ts
│   │   └── user.controller.ts
│   ├── services/
│   │   ├── articles.ts
│   │   ├── bookings.ts
│   │   ├── chats.ts
│   │   ├── discussions.ts
│   │   ├── events.ts
│   │   ├── forms.ts
│   │   ├── game.ts
│   │   ├── itemBorrowings.ts
│   │   ├── items.ts
│   │   ├── rooms.ts
│   │   ├── stats.ts
│   │   ├── tasks.ts
│   │   ├── tickets.ts
│   │   ├── transactions.ts
│   │   └── users.ts
│   ├── models/
│   │   ├── types.ts              # Tipe data utama (Zod schemas)
│   │   └── game.types.ts         # Tipe data game
│   ├── middlewares/
│   │   └── auth.ts               # JWT authentication
│   ├── routes/
│   │   └── index.ts              # Registrasi semua route
│   └── durable-objects/
│       └── ChatRoom.ts           # WebSocket Durable Object
├── migrations/                   # File migrasi SQL database
│   ├── 001_init.sql
│   ├── 002_add_articles.sql
│   ├── 003_add_owner_to_tasks_and_articles.sql
│   ├── 004_add_room_booking.sql
│   ├── 005_add_chat_system.sql
│   ├── 007_add_forms.sql
│   ├── 008_add_discussion_forum.sql
│   ├── 008_add_ticketing.sql
│   ├── 009_add_items.sql
│   ├── 010_add_events.sql
│   ├── 011_add_performance_indexes.sql
│   └── 012_add_balance.sql
├── wrangler.jsonc                # Konfigurasi Cloudflare Workers
└── package.json
```

### Entry Point dan Konfigurasi

**`src/index.ts`** — Konfigurasi utama:
- Framework: **Hono** dengan **Chanfana** (OpenAPI auto-documentation)
- CORS: `origin: "*"`, methods: `GET, POST, PUT, DELETE, OPTIONS`
- WebSocket route `/chat` menggunakan Durable Objects (ChatRoom)
- Semua route didaftarkan melalui `registerRoutes()`

**`wrangler.jsonc`** — Konfigurasi Cloudflare Workers:
- Database binding: D1 (SQLite)
- Durable Object: ChatRoom
- Observability: enabled

**`package.json`** — Dependensi utama:
- `hono` — Web framework
- `chanfana` — OpenAPI integration
- `jose` — JWT token handling
- `bcryptjs` — Password hashing
- `zod` — Schema validation

### Controller

Semua controller meng-extend `BaseController` yang menyediakan pola standar untuk request handling dan response formatting.

#### Daftar Controller

| File | Kelas | Fungsi |
|------|-------|--------|
| `authLogin.ts` | AuthLogin | Login pengguna |
| `authRegister.ts` | AuthRegister | Registrasi pengguna baru |
| `authForgotPassword.ts` | AuthForgotPassword | Reset password |
| `user.controller.ts` | UserController | CRUD pengguna, transfer, top-up, riwayat transaksi, update profil |
| `task.controller.ts` | TaskController | CRUD tugas |
| `article.controller.ts` | ArticleList, ArticleGet, ArticleCreate, ArticleUpdate, ArticleDelete | CRUD artikel (auth) |
| `publicArticle.controller.ts` | PublicArticleList, PublicArticleGet | Baca artikel publik |
| `room.controller.ts` | RoomList, RoomGet, RoomCreate, RoomUpdate, RoomDelete | CRUD ruangan |
| `booking.controller.ts` | BookingList, BookingGet, BookingCreate, BookingUpdateStatus, BookingUpdate, BookingCancel | CRUD booking |
| `chat.controller.ts` | ConversationList, ConversationGetOrCreate, ConversationMessages, MessageSend, GroupList, GroupCreate, GroupGet, GroupUpdate, GroupDelete, GroupMessages, GroupMembers, GroupAddMember, GroupRemoveMember, GroupUpdateMemberRole | Chat dan grup chat |
| `anonymousChat.controller.ts` | AnonymousMessageList, AnonymousMessageSend, AnonymousMessageDeleteAll | Chat anonim |
| `form.controller.ts` | FormList, FormGet, FormGetByToken, FormCreate, FormUpdate, FormDelete, FormResponseSubmit, FormResponseList, FormResponseGet | Formulir dan respons |
| `item.controller.ts` | ItemList, ItemGet, ItemCreate, ItemUpdate, ItemDelete | CRUD barang |
| `itemBorrowing.controller.ts` | ItemBorrowingList, ItemBorrowingGet, ItemBorrowingCreate, ItemBorrowingUpdateStatus, ItemBorrowingCancel | Peminjaman barang |
| `discussion.controller.ts` | DiscussionList, DiscussionGet, DiscussionCreate, DiscussionReplyCreate, DiscussionDelete | Forum diskusi |
| `ticket.controller.ts` | CategoryList, TicketList, TicketGet, TicketUpdate, TicketDelete, TicketCommentList, TicketCommentCreate, TicketAssignmentList, TicketAssign, TicketStatsGet, PublicTicketCreate, PublicTicketGetByToken, PublicTicketCommentCreate, PublicTicketCommentList | Sistem tiket |
| `event.controller.ts` | EventList, EventGet, EventCreate, EventUpdate, EventDelete, EventAttendeeList, EventAttendeeRegister, EventAttendeeUpdateStatus, EventAttendeeUnregister, EventAdminList, EventAdminAssign, EventAdminRemove, AttendanceScanCreate, AttendeeWithScansGet, EventScanHistoryList | Event dan kehadiran |
| `game.controller.ts` | GameProfileGet, GameProfileReset, GameFarmGet, GameFarmPlant, GameFarmWater, GameFarmPlaceItem, GameFarmRemoveItem, GameFarmUseItem, GameFarmHarvest, GameFarmHarvestAll, GameFarmExpand, GameCropsList, GameShopList, GameShopPurchase, GameInventoryList, GameAchievementsList, GameAchievementClaim, GameQuestsList, GameQuestClaim, GameLeaderboardGet, GameExchangeBalanceToGems, GameExchangeBalanceToGold, GameConstantsGet, GamePrestigeReset, GameObstaclesList, GameObstacleRemove | Farming game |
| `gameAdmin.controller.ts` | GameAdminPlayersList, GameAdminItemsCreate, GameAdminItemsUpdate, GameAdminItemsDelete | Admin game |
| `stats.controller.ts` | StatsGet | Statistik dashboard |
| `seed.controller.ts` | SeedDatabase | Seed data awal |

### Service Layer

Setiap service berisi logika bisnis dan operasi database:

| File | Deskripsi |
|------|-----------|
| `users.ts` | CRUD pengguna, autentikasi |
| `tasks.ts` | Operasi tugas |
| `articles.ts` | Operasi artikel |
| `rooms.ts` | Manajemen ruangan |
| `bookings.ts` | Manajemen booking |
| `chats.ts` | AnonymousChatService |
| `forms.ts` | Formulir dan respons |
| `items.ts` | Inventaris barang |
| `itemBorrowings.ts` | Alur peminjaman |
| `discussions.ts` | Forum diskusi |
| `tickets.ts` | Sistem tiket |
| `events.ts` | Manajemen event |
| `transactions.ts` | Transfer dan top-up |
| `stats.ts` | Kalkulasi statistik |
| `game.ts` | Mekanik game |

### Middleware

**`auth.ts`** — Middleware autentikasi JWT:

- `createToken(record)` — Membuat JWT token (berlaku 7 hari)
- `parseToken(token)` — Verifikasi dan parse JWT token
- `getTokenPayloadFromRequest(c)` — Mengambil token dari header `Authorization: Bearer <token>`
- `ensureAdmin(c)` — Validasi bahwa pengguna memiliki peran admin

### Model dan Tipe Data

**`types.ts`** — Tipe data utama menggunakan Zod schemas:

| Model | Field Utama |
|-------|------------|
| User | username, name, password, role (admin/member), balance |
| Task | slug, name, description, completed, due_date, owner |
| Article | slug, title, content, published, owner |
| Room | name, capacity, description, available |
| Booking | room_id, user_username, start_time, end_time, status (pending/approved/rejected/cancelled), purpose |
| Message | conversation_id/group_id, sender_username, content, reply_to_id |
| GroupChat | name, description, created_by |
| GroupMember | group_id, user_username, role (admin/member) |
| AnonymousMessage | sender_id, content, reply_to_id |
| Form | title, description, token, created_by |
| FormQuestion | form_id, question_text, question_order |
| FormResponse | form_id, respondent_name |
| Item | name, description, stock, attachment_link, owner_username |
| ItemBorrowing | item_id, borrower_username, quantity, start_date, end_date, status (pending/approved/rejected/returned/damaged/extended), notes |
| Discussion | title, content, creator_username, creator_name, is_anonymous |
| DiscussionReply | discussion_id, content, creator_username, creator_name, is_anonymous |
| Ticket | token, title, description, category_id, status (open/in_progress/waiting/solved), priority (low/medium/high/critical), submitter_name, submitter_email |
| TicketComment | ticket_id, commenter_type (guest/user), commenter_name, comment_text, is_internal |
| TicketAssignment | ticket_id, assigned_from, assigned_to, assigned_by, notes |
| Event | title, description, event_date, location, created_by |
| EventAttendee | event_id, user_username, attendance_token, status (registered/present/absent) |
| AttendanceScan | attendee_id, scanned_by, scanned_at, latitude, longitude |
| Transaction | from_username, to_username, amount, type (transfer/topup), description |

**`game.types.ts`** — Tipe data game:

| Model | Field Utama |
|-------|------------|
| GameFarmProfile | level, experience, gold, gems, prestige_level |
| GameCrop | name, tier, grow_time, sell_price, seed_price, unlock_level, xp_reward |
| GameShopItem | name, type, price_gold, price_gems, unlock_level, max_quantity |
| GameInventoryItem | item_id, quantity, equipped |
| GameFarmPlot | x, y, crop_id, placed_item_id, growth_percent, watered, auto_replant |
| GameAchievement | name, description, reward_gold, reward_gems |
| GameDailyQuest | quest_type, target_value, current_value, reward_gold, reward_gems |
| GameObstacle | type, x, y, remove_cost |

Konstanta game: `INITIAL_GOLD=100`, `INITIAL_GEMS=10`, `INITIAL_PLOTS=9`, `MAX_PLOTS=49`.

### Daftar Endpoint API

#### Autentikasi (Publik)

| Method | Path | Deskripsi |
|--------|------|-----------|
| POST | `/api/auth/login` | Login pengguna |
| POST | `/api/auth/register` | Registrasi pengguna baru |
| POST | `/api/auth/forgot-password` | Forgot password |

#### Endpoint Publik (Tanpa Auth)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/public/articles` | Daftar artikel publik |
| GET | `/api/public/articles/:slug` | Detail artikel publik |
| GET | `/api/public/forms/:token` | Ambil formulir via token |
| POST | `/api/public/forms/:token/submit` | Kirim respons formulir |
| POST | `/api/public/tickets` | Buat tiket publik |
| GET | `/api/public/tickets/:token` | Lihat tiket via token |
| GET | `/api/public/tickets/:token/comments` | Komentar tiket via token |
| POST | `/api/public/tickets/:token/comments` | Tambah komentar tiket publik |

#### Pengguna (Auth Required)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/users` | Daftar pengguna |
| POST | `/api/users` | Buat pengguna baru |
| GET | `/api/users/:username` | Detail pengguna |
| PUT | `/api/users/:username` | Update pengguna |
| DELETE | `/api/users/:username` | Hapus pengguna |
| PUT | `/api/profile` | Update profil sendiri |

#### Transaksi (Auth Required)

| Method | Path | Deskripsi |
|--------|------|-----------|
| POST | `/api/users/transfer` | Transfer saldo |
| POST | `/api/users/topup` | Top-up saldo |
| GET | `/api/transactions` | Riwayat transaksi |

#### Statistik (Auth Required)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/stats` | Statistik dashboard |

#### Tugas (Auth Required)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/tasks` | Daftar tugas |
| POST | `/api/tasks` | Buat tugas |
| GET | `/api/tasks/:taskId` | Detail tugas |
| PUT | `/api/tasks/:taskId` | Update tugas |
| DELETE | `/api/tasks/:taskId` | Hapus tugas |

#### Artikel (Auth Required)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/articles` | Daftar artikel |
| POST | `/api/articles` | Buat artikel |
| GET | `/api/articles/:slug` | Detail artikel |
| PUT | `/api/articles/:slug` | Update artikel |
| DELETE | `/api/articles/:slug` | Hapus artikel |

#### Ruangan (Auth Required)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/rooms` | Daftar ruangan |
| POST | `/api/rooms` | Buat ruangan |
| GET | `/api/rooms/:roomId` | Detail ruangan |
| PUT | `/api/rooms/:roomId` | Update ruangan |
| DELETE | `/api/rooms/:roomId` | Hapus ruangan |

#### Booking (Auth Required)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/bookings` | Daftar booking |
| POST | `/api/bookings` | Buat booking |
| GET | `/api/bookings/:bookingId` | Detail booking |
| PUT | `/api/bookings/:bookingId` | Update status booking |
| PUT | `/api/bookings/:bookingId/edit` | Edit booking |
| DELETE | `/api/bookings/:bookingId` | Batalkan booking |

#### Chat (Auth Required)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/conversations` | Daftar percakapan |
| GET | `/api/conversations/:username` | Ambil/buat percakapan dengan user |
| GET | `/api/conversations/:conversationId/messages` | Pesan dalam percakapan |
| POST | `/api/messages` | Kirim pesan |

#### Grup Chat (Auth Required)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/groups` | Daftar grup |
| POST | `/api/groups` | Buat grup |
| GET | `/api/groups/:groupId` | Detail grup |
| PUT | `/api/groups/:groupId` | Update grup |
| DELETE | `/api/groups/:groupId` | Hapus grup |
| GET | `/api/groups/:groupId/messages` | Pesan dalam grup |
| GET | `/api/groups/:groupId/members` | Anggota grup |
| POST | `/api/groups/:groupId/members` | Tambah anggota |
| DELETE | `/api/groups/:groupId/members/:username` | Hapus anggota |
| PUT | `/api/groups/:groupId/members/:username/role` | Ubah peran anggota |

#### Chat Anonim (Auth Required)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/anonymous/messages` | Daftar pesan anonim |
| POST | `/api/anonymous/messages` | Kirim pesan anonim |
| DELETE | `/api/anonymous/messages` | Hapus semua pesan anonim |

#### Formulir (Auth Required)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/forms` | Daftar formulir |
| POST | `/api/forms` | Buat formulir |
| GET | `/api/forms/:formId` | Detail formulir |
| PUT | `/api/forms/:formId` | Update formulir |
| DELETE | `/api/forms/:formId` | Hapus formulir |
| GET | `/api/forms/:formId/responses` | Daftar respons |
| GET | `/api/forms/:formId/responses/:responseId` | Detail respons |

#### Barang (Auth Required)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/items` | Daftar barang |
| POST | `/api/items` | Buat barang |
| GET | `/api/items/:itemId` | Detail barang |
| PUT | `/api/items/:itemId` | Update barang |
| DELETE | `/api/items/:itemId` | Hapus barang |

#### Peminjaman Barang (Auth Required)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/item-borrowings` | Daftar peminjaman |
| POST | `/api/item-borrowings` | Buat peminjaman |
| GET | `/api/item-borrowings/:borrowingId` | Detail peminjaman |
| PUT | `/api/item-borrowings/:borrowingId/status` | Update status peminjaman |
| DELETE | `/api/item-borrowings/:borrowingId` | Batalkan peminjaman |

#### Diskusi (Auth Required)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/discussions` | Daftar diskusi |
| POST | `/api/discussions` | Buat diskusi |
| GET | `/api/discussions/:discussionId` | Detail diskusi |
| POST | `/api/discussions/:discussionId/replies` | Balas diskusi |
| DELETE | `/api/discussions/:discussionId` | Hapus diskusi |

#### Tiket (Auth Required)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/tickets/categories` | Daftar kategori |
| GET | `/api/tickets` | Daftar tiket |
| GET | `/api/tickets/stats` | Statistik tiket |
| GET | `/api/tickets/:ticketId` | Detail tiket |
| PUT | `/api/tickets/:ticketId` | Update tiket |
| DELETE | `/api/tickets/:ticketId` | Hapus tiket |
| GET | `/api/tickets/:ticketId/comments` | Komentar tiket |
| POST | `/api/tickets/:ticketId/comments` | Tambah komentar |
| GET | `/api/tickets/:ticketId/assignments` | Daftar penugasan |
| POST | `/api/tickets/:ticketId/assign` | Tugaskan tiket |

#### Event (Auth Required)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/events` | Daftar event |
| POST | `/api/events` | Buat event |
| GET | `/api/events/:eventId` | Detail event |
| PUT | `/api/events/:eventId` | Update event |
| DELETE | `/api/events/:eventId` | Hapus event |
| GET | `/api/events/:eventId/attendees` | Daftar peserta |
| POST | `/api/events/register` | Registrasi peserta |
| PUT | `/api/events/:eventId/attendees/:attendeeId/status` | Update status peserta |
| DELETE | `/api/events/:eventId/attendees/:attendeeId` | Batal registrasi |
| GET | `/api/events/:eventId/attendees/:attendeeId/scans` | Data scan peserta |
| GET | `/api/events/:eventId/admins` | Daftar admin event |
| POST | `/api/events/:eventId/admins` | Tambah admin event |
| DELETE | `/api/events/:eventId/admins/:username` | Hapus admin event |
| POST | `/api/events/:eventId/scan` | Scan kehadiran |
| GET | `/api/events/:eventId/scan-history` | Riwayat scan |

#### Game (Auth Required)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/game/constants` | Konstanta game |
| GET | `/api/game/profile` | Profil game pemain |
| POST | `/api/game/profile/reset` | Prestige reset |
| GET | `/api/game/farm` | Data lahan |
| POST | `/api/game/farm/plant` | Tanam di petak |
| POST | `/api/game/farm/place` | Tempatkan item di petak |
| POST | `/api/game/farm/remove` | Hapus item dari petak |
| POST | `/api/game/farm/use` | Gunakan item |
| POST | `/api/game/farm/water` | Siram tanaman |
| POST | `/api/game/farm/harvest` | Panen satu tanaman |
| POST | `/api/game/farm/harvest-all` | Panen semua tanaman matang |
| POST | `/api/game/farm/expand` | Perluas lahan |
| GET | `/api/game/crops` | Daftar jenis tanaman |
| GET | `/api/game/shop` | Daftar toko |
| POST | `/api/game/shop/purchase` | Beli item dari toko |
| GET | `/api/game/inventory` | Inventaris pemain |
| GET | `/api/game/achievements` | Daftar pencapaian |
| POST | `/api/game/achievements/:achievementId/claim` | Klaim pencapaian |
| GET | `/api/game/quests/daily` | Quest harian |
| POST | `/api/game/quests/:questId/claim` | Klaim hadiah quest |
| GET | `/api/game/leaderboard` | Leaderboard |
| POST | `/api/game/exchange/gems` | Tukar saldo ke gems |
| POST | `/api/game/exchange/gold` | Tukar saldo ke gold |
| GET | `/api/game/obstacles` | Daftar rintangan |
| POST | `/api/game/obstacles/:obstacleId/remove` | Hapus rintangan |

#### Game Admin (Auth Required, Admin Only)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/game/admin/players` | Daftar pemain |
| POST | `/api/game/admin/items` | Buat item game |
| PUT | `/api/game/admin/items/:id` | Update item game |
| DELETE | `/api/game/admin/items/:id` | Hapus item game |

#### Sistem (Auth Required)

| Method | Path | Deskripsi |
|--------|------|-----------|
| POST | `/api/seed` | Seed database dengan data awal |

### Skema Database

Database menggunakan Cloudflare D1 (SQLite) dengan 12 file migrasi.

#### Tabel Utama

| Tabel | Deskripsi | Migrasi |
|-------|-----------|---------|
| `users` | username (PK), name, password, role, balance, created_at | 001, 012 |
| `tasks` | slug (PK), name, description, completed, due_date, owner | 001, 003 |
| `articles` | slug (PK), title, content, published, owner, created_at, updated_at | 002, 003 |
| `rooms` | id (PK), name, capacity, description, available | 004 |
| `bookings` | id (PK), room_id, user_username, start_time, end_time, status, purpose | 004 |
| `conversations` | id (PK), user1_username, user2_username | 005 |
| `messages` | id (PK), conversation_id, group_id, sender_username, content, reply_to_id | 005 |
| `group_chats` | id (PK), name, description, created_by | 005 |
| `group_members` | group_id, user_username, role | 005 |
| `anonymous_messages` | id (PK), sender_id, content, reply_to_id | 005 |
| `forms` | id (PK), title, description, token, created_by | 007 |
| `form_questions` | id (PK), form_id, question_text, question_order | 007 |
| `form_responses` | id (PK), form_id, respondent_name, submitted_at | 007 |
| `form_answers` | id (PK), response_id, question_id, answer_text | 007 |
| `discussions` | id (PK), title, content, creator_username, creator_name, is_anonymous | 008 |
| `discussion_replies` | id (PK), discussion_id, content, creator_username, creator_name, is_anonymous | 008 |
| `ticket_categories` | id (PK), name, description | 008 |
| `tickets` | id (PK), token, title, description, category_id, status, priority, submitter_name, submitter_email, assigned_to | 008 |
| `ticket_comments` | id (PK), ticket_id, commenter_type, commenter_name, comment_text, is_internal | 008 |
| `ticket_assignments` | id (PK), ticket_id, assigned_from, assigned_to, assigned_by, notes | 008 |
| `items` | id (PK), name, description, stock, attachment_link, owner_username | 009 |
| `item_borrowings` | id (PK), item_id, borrower_username, quantity, start_date, end_date, status, notes | 009 |
| `events` | id (PK), title, description, event_date, location, created_by | 010 |
| `event_attendees` | id (PK), event_id, user_username, attendance_token, status | 010 |
| `event_admins` | id (PK), event_id, user_username, assigned_by | 010 |
| `attendance_scans` | id (PK), attendee_id, scanned_by, scanned_at, latitude, longitude | 010 |
| `transactions` | id (PK), from_username, to_username, amount, type, description | 012 |

Migrasi `011_add_performance_indexes.sql` menambahkan index untuk optimasi performa query.

### WebSocket dan Durable Objects

Komunikasi real-time untuk chat menggunakan Cloudflare Durable Objects:

- Route: `/chat` di `src/index.ts`
- Implementasi: `src/durable-objects/ChatRoom.ts`
- Setiap ChatRoom adalah instance Durable Object yang mengelola koneksi WebSocket

---

## Frontend Web

### Struktur Direktori Frontend

```
frontend/
├── index.tsx              # Root renderer
├── App.tsx                # Routing utama (React Router v7)
├── vite.config.ts         # Konfigurasi Vite (proxy API, chunk splitting)
├── tailwind.config.*      # Konfigurasi Tailwind CSS
├── lib/
│   └── api/
│       ├── client.ts      # HTTP client dengan auth header
│       ├── services.ts    # Semua API service functions
│       ├── types.ts       # TypeScript types
│       └── index.ts       # Export terpusat
├── components/
│   ├── ui/                # Komponen UI reusable (Button, Input, Card, Select, Loading, Divider, dll.)
│   ├── chat/              # Komponen chat (ChatHeader, MessageBubble, MessageInput, DateSeparator)
│   ├── room/              # Komponen ruangan (RoomList, RoomDetail, RoomForm, BookingCard, BookingTimeline)
│   ├── Navbar.tsx         # Navigasi utama
│   ├── DashboardLayout.tsx # Layout sidebar dashboard
│   ├── Footer.tsx
│   ├── ThemeToggle.tsx
│   ├── ProtectedRoute.tsx # Route guard untuk halaman auth
│   ├── Hero.tsx, About.tsx, Portfolio.tsx, Experience.tsx, Research.tsx, Contact.tsx  # Landing page sections
│   ├── OfflineNotification.tsx, InstallPrompt.tsx, SessionTimer.tsx
│   └── ...                # 71+ komponen total
├── pages/                 # 37 halaman
├── hooks/                 # 7 custom hooks
├── contexts/              # 3 context provider
└── utils/
```

### Routing

Routing dikonfigurasi di `App.tsx` menggunakan React Router v7 dengan lazy loading:

| Path | Halaman | Akses |
|------|---------|-------|
| `/` | LandingPage | Publik |
| `/articles` | ArticlesPage | Publik |
| `/discussions` | DiscussionForumPage | Publik |
| `/discussions/:id` | DiscussionDetailPage | Publik |
| `/login` | LoginPage | Publik |
| `/register` | RegisterPage | Publik |
| `/forgot-password` | ForgotPasswordPage | Publik |
| `/form/:token` | FormFillPage | Publik |
| `/finance` | FinancePage | Publik |
| `/dashboard` | DashboardPage (dengan DashboardOverviewPage) | Auth |
| `/dashboard/users` | DashboardUsersPage | Auth (Admin) |
| `/dashboard/tasks` | DashboardTasksPage | Auth |
| `/dashboard/chat` | DashboardChatPage | Auth |
| `/dashboard/articles` | DashboardArticlesPage | Auth |
| `/dashboard/articles/create` | ArticleCreatePage | Auth |
| `/dashboard/articles/edit/:slug` | ArticleEditPage | Auth |
| `/dashboard/rooms` | DashboardRoomsPage | Auth |
| `/dashboard/rooms/new` | DashboardRoomFormPage | Auth |
| `/dashboard/rooms/:id` | DashboardRoomDetailPage | Auth |
| `/dashboard/bookings` | DashboardBookingsPage | Auth |
| `/dashboard/bookings/new` | DashboardBookingFormPage | Auth |
| `/dashboard/bookings/:id` | DashboardBookingDetailPage | Auth |
| `/dashboard/forms` | DashboardFormsPage | Auth |
| `/dashboard/forms/new` | DashboardFormEditorPage | Auth |
| `/dashboard/forms/:formId/edit` | DashboardFormEditorPage | Auth |
| `/dashboard/forms/:formId/responses` | DashboardFormResponsesPage | Auth |
| `/dashboard/forms/:formId/responses/:responseId` | DashboardFormResponseDetailPage | Auth |
| `/dashboard/items` | DashboardItemsPage | Auth |
| `/dashboard/item-borrowings` | DashboardItemBorrowingsPage | Auth |
| `/dashboard/tickets` | DashboardTicketsPage | Auth |
| `/dashboard/tickets/:id` | DashboardTicketDetailPage | Auth |
| `/dashboard/events` | DashboardEventsPage | Auth |
| `/dashboard/events/new` | DashboardEventFormPage | Auth |
| `/dashboard/events/:id` | DashboardEventDetailPage | Auth |
| `/dashboard/events/:id/scan` | DashboardEventScanPage | Auth |
| `/dashboard/events/:id/scan-history` | DashboardEventScanHistoryPage | Auth |

### API Client

API client terpusat di `lib/api/`:

- **`client.ts`** — HTTP client yang otomatis menyertakan token dari `localStorage` di header `Authorization`
- **`services.ts`** — Berisi semua fungsi API yang terorganisir per service:
  - `authService` — login, register, forgotPassword
  - `userService` — list, get, create, update, delete, transfer, topUp
  - `taskService` — list, get, create, update, delete
  - `articleService` — list, get, create, update, delete
  - `roomService` — list, get, create, update, delete
  - `bookingService` — list, get, create, update, delete
  - `statsService` — getDashboardStats
  - Dan service lainnya untuk Forms, Items, ItemBorrowings, Tickets, Events, Discussion, Chat, dll.
- **`types.ts`** — Definisi TypeScript types

### Halaman

37 halaman yang terbagi menjadi:

- **Publik**: LandingPage, ArticlesPage, DiscussionForumPage, DiscussionDetailPage, FinancePage, LoginPage, RegisterPage, ForgotPasswordPage, FormFillPage
- **Dashboard Overview**: DashboardPage, DashboardOverviewPage
- **Pengguna**: DashboardUsersPage (admin only)
- **Tugas**: DashboardTasksPage
- **Chat**: DashboardChatPage, FullscreenAnonymousChatPage
- **Artikel**: DashboardArticlesPage, ArticleCreatePage, ArticleEditPage
- **Ruangan**: DashboardRoomsPage, DashboardRoomFormPage, DashboardRoomDetailPage
- **Booking**: DashboardBookingsPage, DashboardBookingFormPage, DashboardBookingDetailPage
- **Formulir**: DashboardFormsPage, DashboardFormEditorPage, DashboardFormResponsesPage, DashboardFormResponseDetailPage
- **Barang**: DashboardItemsPage, DashboardItemBorrowingsPage
- **Tiket**: DashboardTicketsPage, DashboardTicketDetailPage
- **Event**: DashboardEventsPage, DashboardEventFormPage, DashboardEventDetailPage, DashboardEventScanPage, DashboardEventScanHistoryPage

### Komponen

Komponen UI reusable di folder `components/ui/`:

| Komponen | Fungsi |
|----------|--------|
| `Button` | Tombol dengan variant dan loading state |
| `Input` | Input field |
| `Card` | Kartu container |
| `Select` | Dropdown select |
| `Loading` | Indikator loading |
| `Divider` | Pemisah visual |
| `HandwritingText` | Teks dengan gaya handwriting |
| `Typography` | Komponen tipografi |
| `StickyNote` | Komponen catatan tempel |

Komponen fitur lainnya: Navbar, DashboardLayout, Footer, ThemeToggle, ProtectedRoute, Hero, About, Portfolio, Experience, Research, Contact, TypewriterText, TiltCard, ScrollReveal, SpotlightCard, OfflineNotification, InstallPrompt, SessionTimer, BackendLoader, SketchLoader, PrintButton, LiveClock, AnonymousChatModal, TransferModal, TopUpModal, GroupManagementModal, dan lainnya.

### Hooks

| Hook | Fungsi |
|------|--------|
| `useAuth` | State autentikasi dan login |
| `useApi` | Request API dengan loading dan error handling |
| `useForm` | Manajemen state formulir |
| `useLoaderMutation` | Mutation dengan loader UI |
| `useIntersectionObserver` | Deteksi visibilitas elemen |
| `useParallax` | Efek parallax scroll |

### Context Provider

| Context | Fungsi |
|---------|--------|
| `ThemeContext` | Toggle dark/light mode (disimpan di localStorage) |
| `BackendLoaderContext` | Loading overlay untuk operasi async |
| `LandingDataContext` | Prefetch data landing page (profil, proyek, penelitian, pendidikan, pengalaman) |

### Konfigurasi Tailwind CSS

- Custom color palette: 40+ warna untuk dark/light mode, status, chat, dan gradien
- Font families: Inter, Poppins, Caveat, Patrick Hand, Indie Flower
- Custom animations: fade-in-up, float, wiggle, blob, spin-slow
- Custom screen: xs (475px)

---

## Mobile App (Expo)

### Struktur Direktori Mobile

```
expojs/
├── app/                           # File-based routing (Expo Router)
│   ├── _layout.tsx                # Root layout
│   ├── (auth)/                    # Grup auth (login, register, forgot-password)
│   ├── (public)/                  # Grup publik (artikel)
│   ├── (tabs)/                    # Grup tab utama
│   ├── modal.tsx                  # Modal overlay
│   ├── topup.tsx                  # Top-up saldo
│   ├── transfer.tsx               # Transfer saldo
│   ├── article/                   # Detail artikel
│   ├── chat/                      # Messaging
│   ├── discussions/               # Thread diskusi
│   ├── events/                    # Manajemen event
│   ├── forms/                     # Form handling
│   ├── items/                     # Daftar barang
│   └── tickets/                   # Sistem tiket
├── screens/                       # Screen components
│   ├── HomeScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── auth/                      # LoginScreen, RegisterScreen, ForgotPasswordScreen
│   ├── articles/                  # ArticlesScreen, PublicArticlesScreen
│   ├── bookings/                  # BookingsScreen
│   ├── chat/                      # ChatScreen, ChatDetailScreen
│   ├── discussions/               # DiscussionsScreen, DiscussionDetailScreen
│   ├── events/                    # EventsListScreen, EventDetailScreen, EventFormScreen, EventScanScreen, EventScanHistoryScreen
│   ├── forms/                     # FormsScreen, FormEditorScreen
│   ├── item-borrowings/           # ItemBorrowingsScreen
│   ├── items/                     # ItemsScreen, BorrowItemScreen
│   ├── notifications/             # NotificationsScreen
│   ├── profile/                   # ProfileHeader, ProfileInfoSection, PasswordSection
│   ├── tasks/                     # TasksScreen, TaskCard, TaskFormDialog, TaskList
│   ├── tickets/                   # TicketsScreen, TicketDetailScreen
│   ├── users/                     # UsersScreen
│   └── wallet/                    # TransactionHistoryScreen
├── components/
│   ├── AuthenticatedSidebarLayout.tsx
│   ├── SidebarLayout.tsx
│   ├── GlobalFeedback.tsx
│   ├── DatePickerInput.tsx
│   ├── GlassCard.tsx
│   ├── parallax-scroll-view.tsx
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   └── ui/                        # collapsible, icon-symbol
├── services/
│   ├── api.ts                     # API client wrapper
│   ├── api/                       # 18 modul API terpisah
│   │   ├── base.ts, index.ts
│   │   ├── auth.ts, users.ts, tasks.ts, articles.ts
│   │   ├── rooms.ts, bookings.ts, chat.ts
│   │   ├── forms.ts, items.ts, item-borrowings.ts
│   │   ├── discussions.ts, tickets.ts, events.ts
│   │   ├── notifications.ts, stats.ts, wallet.ts
│   │   └── index.ts
│   ├── queryClient.ts             # Konfigurasi TanStack Query
│   ├── tokenStorage.ts            # Penyimpanan token aman
│   ├── errorEvents.ts             # Error handling
│   └── websocketService.ts        # Koneksi WebSocket
├── hooks/
│   ├── useApi.ts                  # API request wrapper
│   ├── useSavedAccounts.ts        # Manajemen akun tersimpan
│   ├── use-color-scheme.ts        # Deteksi tema
│   ├── use-color-scheme.web.ts    # Deteksi tema (web)
│   └── use-theme-color.ts         # Manajemen warna tema
├── contexts/
│   └── AuthContext.tsx             # State autentikasi global
├── app.json                       # Konfigurasi Expo (com.atiohaidar.expojs)
├── eas.json                       # Konfigurasi EAS Build
└── package.json
```

### Navigasi dan Routing

Expo Router menggunakan file-based routing dengan grup navigasi:

| Grup | Deskripsi |
|------|-----------|
| `(auth)` | Halaman autentikasi: login, register, forgot-password |
| `(public)` | Halaman publik: artikel tanpa login |
| `(tabs)` | Tab utama setelah login |

### Screens

| Screen | Fungsi |
|--------|--------|
| HomeScreen | Halaman utama setelah login |
| ProfileScreen | Profil pengguna |
| LoginScreen, RegisterScreen, ForgotPasswordScreen | Autentikasi |
| TasksScreen | Manajemen tugas |
| ArticlesScreen, PublicArticlesScreen | Artikel |
| BookingsScreen | Daftar booking |
| ChatScreen, ChatDetailScreen | Percakapan dan detail chat |
| DiscussionsScreen, DiscussionDetailScreen | Forum diskusi |
| EventsListScreen, EventDetailScreen, EventFormScreen | Event |
| EventScanScreen, EventScanHistoryScreen | Scan kehadiran QR |
| FormsScreen, FormEditorScreen | Formulir |
| ItemsScreen, BorrowItemScreen | Barang dan peminjaman |
| ItemBorrowingsScreen | Daftar peminjaman |
| TicketsScreen, TicketDetailScreen | Tiket dukungan |
| UsersScreen | Daftar pengguna |
| NotificationsScreen | Notifikasi |
| TransactionHistoryScreen | Riwayat transaksi |
| TopUpScreen, TransferScreen | Top-up dan transfer |

### Services

API services terorganisir per modul di `services/api/`:

| Service | Fungsi |
|---------|--------|
| `auth.ts` | Login, register, forgot password |
| `users.ts` | CRUD pengguna |
| `tasks.ts` | Operasi tugas |
| `articles.ts` | Operasi artikel |
| `rooms.ts` | Manajemen ruangan |
| `bookings.ts` | Manajemen booking |
| `chat.ts` | Messaging API |
| `forms.ts` | Formulir |
| `items.ts` | Barang |
| `item-borrowings.ts` | Peminjaman |
| `discussions.ts` | Forum diskusi |
| `tickets.ts` | Tiket dukungan |
| `events.ts` | Event |
| `notifications.ts` | Notifikasi |
| `stats.ts` | Statistik |
| `wallet.ts` | Operasi keuangan |

Utilitas pendukung:
- `queryClient.ts` — Konfigurasi TanStack React Query
- `tokenStorage.ts` — Penyimpanan token aman (Expo SecureStore)
- `errorEvents.ts` — Sistem penanganan error
- `websocketService.ts` — Koneksi WebSocket untuk real-time chat

### Hooks Mobile

| Hook | Fungsi |
|------|--------|
| `useApi` | Wrapper untuk request API |
| `useSavedAccounts` | Manajemen akun tersimpan |
| `use-color-scheme` | Deteksi tema sistem (cross-platform) |
| `use-theme-color` | Manajemen warna tema |

### Dependensi Native

Aplikasi mobile menggunakan modul native berikut:
- **expo-camera** dan **expo-barcode-scanner** — Scan QR code untuk kehadiran event
- **expo-location** — GPS untuk scan kehadiran
- **expo-haptics** — Feedback haptic pada interaksi
- **expo-secure-store** — Penyimpanan token aman
- **@react-native-async-storage/async-storage** — Penyimpanan data lokal
- **react-native-qrcode-skia** — Generasi QR code

---

## Development Setup

### Prasyarat

- Node.js 18+
- npm
- Akun Cloudflare (untuk backend)
- Akun Expo (untuk mobile)

### Instalasi

```bash
git clone https://github.com/atiohaidar/atiohaidar.github.io.git
cd atiohaidar.github.io

cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd expojs && npm install && cd ..
```

### Menjalankan Development

```bash
# Semua sekaligus (backend + frontend)
./run_dev.sh

# Atau terpisah:
cd backend && npm run dev       # API di port 8787
cd frontend && npm run dev      # Web dev server
cd expojs && npx expo start     # Expo dev server
```

### Environment Variables

```bash
# Frontend development
# frontend/.env.development
VITE_API_URL=http://localhost:8787

# Frontend production
# frontend/.env.production
VITE_API_URL=https://backend.atiohaidar.workers.dev

# Mobile (opsional)
# expojs/.env
EXPO_PUBLIC_API_BASE_URL=https://backend.atiohaidar.workers.dev
```

Backend menggunakan konfigurasi `wrangler.jsonc` untuk binding database D1 Cloudflare.

### Vite Proxy

Frontend dev server (`vite.config.ts`) mem-proxy request:
- `/api/*` → `http://localhost:8787` (REST API)
- `/chat` → WebSocket proxy ke backend

---

## Deployment

### Backend (Cloudflare Workers)

```bash
cd backend
npm run deploy
```

URL production: `https://backend.atiohaidar.workers.dev`

### Frontend (GitHub Pages)

```bash
cd frontend
npm run build
```

Deploy otomatis via GitHub Actions saat push ke branch `main`.
URL production: `https://atiohaidar.github.io`

### Mobile (EAS Build)

```bash
cd expojs
eas build --platform android    # Build APK Android
eas build --platform ios         # Build untuk iOS
```

Konfigurasi build ada di `eas.json` dengan profil development dan production.

---

## Pola Desain

### Backend — Arsitektur Berlapis

1. **Controller** — Menerima request, validasi input, memanggil service, mengembalikan response
2. **Service** — Logika bisnis dan operasi database
3. **Model** — Definisi tipe data dengan Zod schemas
4. **Middleware** — Autentikasi JWT untuk route yang dilindungi

Semua controller meng-extend `BaseController` untuk pola response yang konsisten.

### Frontend — Komponen Terstruktur

1. **Pages** — Komponen halaman utama (lazy loaded)
2. **Components** — Komponen UI reusable
3. **Hooks** — Logic reusable (useAuth, useApi, useForm)
4. **Contexts** — State global (Theme, Auth, BackendLoader)
5. **API Client** — Service terpusat untuk semua panggilan API

### Mobile — File-Based Routing

1. **App directory** — Routing berbasis file (Expo Router)
2. **Screens** — Komponen layar
3. **Services** — API modules terpisah per fitur
4. **Hooks** — Logic reusable
5. **Context** — State autentikasi global

### Prinsip DRY

- Backend: `BaseController` dan shared schemas mengurangi duplikasi
- Frontend: API client terpusat (`lib/api/`) dan hooks reusable
- Mobile: Service modules terorganisir dan singleton API client
