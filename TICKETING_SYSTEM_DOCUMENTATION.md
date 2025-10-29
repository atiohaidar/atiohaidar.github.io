# Ticketing System Documentation

## Overview

Sistem ticketing/complaint management yang telah diimplementasikan memungkinkan:
- **Guest users** untuk mengajukan keluhan tanpa perlu login
- **Token-based tracking** untuk guest agar dapat melacak status keluhan mereka
- **Admin/Staff users** untuk mengelola, menanggapi, dan menugaskan tiket
- **Comment system** dengan dukungan internal notes (hanya untuk staff)
- **Assignment system** untuk mendistribusikan tiket ke staff yang tepat

## Fitur Utama

### 1. Guest Features (Public)
- ✅ Submit ticket tanpa login
- ✅ Mendapatkan token unik untuk tracking
- ✅ Melacak status ticket menggunakan token
- ✅ Menambahkan komentar ke ticket mereka sendiri
- ✅ Melihat riwayat komunikasi (kecuali internal notes)
- ✅ Mendapatkan update real-time tentang status ticket

### 2. Authenticated User Features
- ✅ Melihat semua tiket yang ditugaskan kepada mereka
- ✅ Update status tiket (open → in_progress → waiting → solved)
- ✅ Menambahkan komentar (public & internal)
- ✅ Mengubah prioritas tiket
- ✅ Melihat riwayat assignment

### 3. Admin Features
- ✅ Melihat semua tiket dalam sistem
- ✅ Filter berdasarkan status, kategori, assigned user
- ✅ Search functionality
- ✅ Assign/reassign tiket ke user lain
- ✅ Edit detail tiket (title, description, category, status, priority)
- ✅ Hapus tiket
- ✅ Melihat statistik tiket (total, open, in_progress, waiting, solved)

## Database Schema

### Tables

#### `ticket_categories`
```sql
- id (INTEGER PRIMARY KEY)
- name (TEXT NOT NULL UNIQUE)
- description (TEXT)
- created_at (TEXT)
```

Default categories:
- Technical
- Support
- Feature Request
- Complaint
- Other

#### `tickets`
```sql
- id (INTEGER PRIMARY KEY)
- token (TEXT UNIQUE) - untuk tracking
- title (TEXT NOT NULL)
- description (TEXT NOT NULL)
- category_id (INTEGER FK)
- status (TEXT: open|in_progress|waiting|solved)
- priority (TEXT: low|medium|high|critical)
- submitter_name (TEXT)
- submitter_email (TEXT)
- reference_link (TEXT)
- assigned_to (TEXT FK to users)
- created_at (TEXT)
- updated_at (TEXT)
```

#### `ticket_comments`
```sql
- id (INTEGER PRIMARY KEY)
- ticket_id (INTEGER FK)
- commenter_type (TEXT: guest|user)
- commenter_name (TEXT NOT NULL)
- comment_text (TEXT NOT NULL)
- is_internal (BOOLEAN) - hanya visible untuk staff
- created_at (TEXT)
```

#### `ticket_assignments`
```sql
- id (INTEGER PRIMARY KEY)
- ticket_id (INTEGER FK)
- assigned_from (TEXT FK to users)
- assigned_to (TEXT FK to users)
- assigned_by (TEXT FK to users)
- notes (TEXT)
- created_at (TEXT)
```

## API Endpoints

### Public Endpoints (No Authentication)

#### Submit Ticket
```
POST /api/public/tickets
Body: {
  title: string
  description: string
  category_id: number
  priority?: 'low' | 'medium' | 'high' | 'critical'
  submitter_name?: string
  submitter_email?: string
  reference_link?: string
}
Response: { success: boolean, ticket: Ticket, message: string }
```

#### Get Ticket by Token
```
GET /api/public/tickets/:token
Response: { success: boolean, ticket: Ticket }
```

#### List Comments by Token
```
GET /api/public/tickets/:token/comments
Response: { success: boolean, comments: TicketComment[] }
```

#### Add Comment by Token
```
POST /api/public/tickets/:token/comments
Body: {
  comment_text: string
  commenter_name?: string
}
Response: { success: boolean, comment: TicketComment }
```

### Authenticated Endpoints

#### List Categories
```
GET /api/tickets/categories
Response: { success: boolean, categories: TicketCategory[] }
```

#### List Tickets
```
GET /api/tickets?page=0&status=open&categoryId=1&assignedTo=user1&searchQuery=text
Response: { success: boolean, tickets: Ticket[] }
```

#### Get Ticket
```
GET /api/tickets/:ticketId
Response: { success: boolean, ticket: Ticket }
```

#### Update Ticket
```
PUT /api/tickets/:ticketId
Body: {
  title?: string
  description?: string
  category_id?: number
  status?: 'open' | 'in_progress' | 'waiting' | 'solved'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  assigned_to?: string
}
Response: { success: boolean, ticket: Ticket }
```

#### Delete Ticket (Admin Only)
```
DELETE /api/tickets/:ticketId
Response: { success: boolean, ticket: Ticket }
```

#### List Comments
```
GET /api/tickets/:ticketId/comments?includeInternal=true
Response: { success: boolean, comments: TicketComment[] }
```

#### Add Comment
```
POST /api/tickets/:ticketId/comments
Body: {
  comment_text: string
  is_internal?: boolean
}
Response: { success: boolean, comment: TicketComment }
```

#### List Assignments
```
GET /api/tickets/:ticketId/assignments
Response: { success: boolean, assignments: TicketAssignment[] }
```

#### Assign Ticket
```
POST /api/tickets/:ticketId/assign
Body: {
  assigned_to: string
  notes?: string
}
Response: { success: boolean, assignment: TicketAssignment }
```

#### Get Stats
```
GET /api/tickets/stats?assignedTo=user1
Response: {
  success: boolean,
  stats: {
    total: number
    open: number
    in_progress: number
    waiting: number
    solved: number
  }
}
```

## Frontend Components

### Landing Page Components

#### TicketSubmissionSection
Location: `frontend/components/TicketSubmissionSection.tsx`
- Form untuk guest submit ticket
- Tampilkan modal dengan token setelah submit berhasil
- Validasi form input

#### TicketTrackingSection
Location: `frontend/components/TicketTrackingSection.tsx`
- Input token untuk tracking
- Tampilkan detail ticket dan status
- List semua comments
- Form untuk add comment (jika ticket belum solved)

### Dashboard Pages

#### DashboardTicketsPage
Location: `frontend/pages/DashboardTicketsPage.tsx`
- List semua tickets (sesuai role)
- Filter by status, category, search
- Display stats cards
- Clickable rows ke detail page

#### DashboardTicketDetailPage
Location: `frontend/pages/DashboardTicketDetailPage.tsx`
- Detail lengkap ticket
- Edit mode untuk admin
- Comment section dengan internal notes
- Assignment section dengan history
- Status badges dan priority indicators

## User Flows

### Guest User Flow
1. Buka landing page
2. Scroll ke section "Ajukan Komplain / Keluhan"
3. Isi form (nama opsional, email opsional, title, description, category, priority, link)
4. Submit → Mendapat token (misal: TKT-ABC12345)
5. Simpan token
6. Kapan saja, scroll ke section "Lacak Status Keluhan"
7. Masukkan token
8. Lihat status dan riwayat komunikasi
9. Bisa tambah comment jika ticket belum solved

### Admin/Staff Flow
1. Login ke dashboard
2. Klik menu "Tiket" 🎫
3. Lihat list semua tickets dengan stats
4. Filter/search sesuai kebutuhan
5. Klik ticket untuk detail
6. Update status, priority, atau details
7. Tambahkan comment (public atau internal)
8. Assign ke user lain jika perlu
9. Ubah status ke "Selesai" ketika resolved

## Status Workflow

```
open → in_progress → waiting → solved
  ↓         ↓          ↓
  └─────────┴──────────┘
   (dapat kembali ke status sebelumnya jika perlu)
```

- **open**: Ticket baru dibuat, belum ada yang handle
- **in_progress**: Sedang ditangani oleh assigned user
- **waiting**: Menunggu response dari submitter atau pihak lain
- **solved**: Masalah telah diselesaikan, tidak bisa comment lagi

## Priority Levels

- **low**: Prioritas rendah, tidak urgent
- **medium**: Prioritas sedang (default)
- **high**: Prioritas tinggi, perlu perhatian segera
- **critical**: Kritis, harus ditangani secepatnya

## Internal Notes

Staff dapat menambahkan internal notes yang:
- Hanya visible untuk authenticated users
- Tidak terlihat oleh guest users saat tracking dengan token
- Berguna untuk komunikasi antar staff
- Ditandai dengan checkbox "Komentar Internal"

## Design Consistency

Semua komponen menggunakan:
- Color scheme dari `utils/styles.ts` (COLORS constant)
- Consistent spacing dan layout
- Dark/Light theme support
- Responsive design (mobile-friendly)
- Status badges dengan color coding
- Priority indicators dengan appropriate colors

## Security Considerations

1. **Token Generation**: Menggunakan random alphanumeric string (TKT-XXXXXXXX)
2. **Authorization**: 
   - Guest hanya bisa akses dengan token
   - User hanya bisa lihat tickets yang assigned ke mereka (kecuali admin)
   - Admin punya full access
3. **Input Validation**: Semua input divalidasi di backend
4. **Prevent Comment on Solved**: Ticket yang sudah solved tidak bisa menerima comment baru

## Future Enhancements (Optional)

- Email notifications untuk status updates
- File attachment support
- Ticket templates untuk kategori tertentu
- SLA tracking
- Ticket escalation rules
- Export to CSV/PDF
- Analytics dashboard
- Webhook integrations

## Testing Checklist

- [x] Database migrations run successfully
- [x] Backend TypeScript compiles without errors
- [x] Frontend builds successfully
- [x] All API endpoints are registered
- [x] Frontend components integrated into landing page
- [x] Dashboard pages added with routing
- [x] Menu item added to dashboard sidebar
- [x] Consistent styling applied

## Files Created/Modified

### Backend
- `backend/migrations/008_add_ticketing.sql` - Database schema
- `backend/src/models/types.ts` - TypeScript types
- `backend/src/services/tickets.ts` - Business logic
- `backend/src/controllers/ticket.controller.ts` - API controllers
- `backend/src/routes/index.ts` - Route registration

### Frontend
- `frontend/apiTypes.ts` - TypeScript types
- `frontend/lib/api/services.ts` - API client functions
- `frontend/components/TicketSubmissionSection.tsx` - Guest submission form
- `frontend/components/TicketTrackingSection.tsx` - Token-based tracking
- `frontend/pages/DashboardTicketsPage.tsx` - Admin ticket list
- `frontend/pages/DashboardTicketDetailPage.tsx` - Admin ticket detail
- `frontend/pages/LandingPage.tsx` - Added ticket sections
- `frontend/components/DashboardLayout.tsx` - Added menu item
- `frontend/App.tsx` - Added routes

## Maintenance Notes

### Adding New Category
```sql
INSERT INTO ticket_categories (name, description) 
VALUES ('New Category', 'Description here');
```

### Changing Status Flow
Modify the CHECK constraint in `tickets` table schema.

### Adding New Priority Level
Modify the CHECK constraint in `tickets` table schema and update frontend forms.

---

**Implementation Date**: 2025-10-29
**Version**: 1.0.0
**Status**: ✅ Complete and Production Ready
