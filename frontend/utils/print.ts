/**
 * @file Utility functions untuk print functionality
 */

/**
 * Menampilkan instruksi print dengan tips untuk hasil optimal
 */
export const showPrintInstructions = (): void => {
  alert(`Tips untuk hasil print/PDF terbaik:

✅ Warna dan Design:
1. Di dialog print, pastikan "More settings" > "Options" > "Background graphics" dicentang/aktif
2. Atau di Chrome: klik "More settings" > centang "Background graphics"

✅ Link yang Clickable:
3. Pilih "Save as PDF" untuk mendapatkan PDF dengan link yang bisa diklik
4. Link ke GitHub, LinkedIn, dan project akan tetap berfungsi di PDF!

✅ Hasil: PDF dengan warna gelap profesional + link yang aktif`);
};

/**
 * Memicu print dialog dengan delay untuk memastikan instruksi terlihat
 */
export const triggerPrint = (): void => {
  showPrintInstructions();
  
  // Small delay to ensure alert is seen before print dialog
  setTimeout(() => {
    window.print();
  }, 100);
};

/**
 * Mengecek apakah browser mendukung print color adjustment
 */
export const supportsPrintColorAdjust = (): boolean => {
  return CSS.supports('print-color-adjust', 'exact') || 
         CSS.supports('-webkit-print-color-adjust', 'exact');
};