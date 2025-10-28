/**
 * @file Menyimpan konstanta yang digunakan di seluruh aplikasi.
 * Memusatkan nilai-nilai ini di satu tempat membuatnya lebih mudah untuk dikelola.
 */

/**
 * Mendefinisikan struktur untuk item tautan navigasi.
 */
interface NavLink {
  name: string;
  href: string;
}

/**
 * Daftar tautan navigasi yang ditampilkan di Navbar.
 * Menambahkan atau menghapus item di sini akan secara otomatis memperbarui navigasi.
 */
export const NAV_LINKS: NavLink[] = [
    { name: 'Tentang Saya', href: '#about' },
    { name: 'Penelitian', href: '#research'},
    { name: 'Portofolio', href: '#portfolio' },
    { name: 'Pengalaman', href: '#experience' },
    { name: 'Kontak', href: '#contact' },
];
