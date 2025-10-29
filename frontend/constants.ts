/**
 * @file Menyimpan konstanta yang digunakan di seluruh aplikasi.
 * Memusatkan nilai-nilai ini di satu tempat membuatnya lebih mudah untuk dikelola.
 */

/**
 * Mendefinisikan struktur untuk item tautan navigasi.
 */
export type NavAction = "ticketing" | "form" | "anonymousChat";

export type NavLink =
  | {
      name: string;
      type: "route";
      href: string;
    }
  | {
      name: string;
      type: "modal";
      action: NavAction;
    };

/**
 * Daftar tautan navigasi yang ditampilkan di Navbar.
 * Menambahkan atau menghapus item di sini akan secara otomatis memperbarui navigasi.
 */
export const NAV_LINKS: NavLink[] = [
    { name: 'Diskusi', type: 'route', href: '/discussions' },
    { name: 'Ticketing', type: 'modal', action: 'ticketing' },
    { name: 'Form', type: 'modal', action: 'form' },
    { name: 'Anonymous Chat', type: 'modal', action: 'anonymousChat' },
    { name: 'Backend Lainnya', type: 'route', href: '/login' },
];
