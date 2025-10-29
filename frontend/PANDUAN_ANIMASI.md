# Panduan Animasi Frontend - Framer Motion

## Daftar Isi
1. [Pengantar](#pengantar)
2. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
3. [Struktur Animasi](#struktur-animasi)
4. [Komponen Animasi](#komponen-animasi)
5. [Cara Menggunakan](#cara-menggunakan)
6. [Customisasi Animasi](#customisasi-animasi)
7. [Best Practices](#best-practices)
8. [Performance Optimization](#performance-optimization)

---

## Pengantar

Aplikasi portfolio ini telah ditingkatkan dengan sistem animasi yang powerful menggunakan **Framer Motion**, library animasi React yang modern dan mudah digunakan. Animasi ini dirancang untuk memberikan pengalaman pengguna yang lebih menarik tanpa mengorbankan performa.

### Fitur Animasi yang Diterapkan:

- ✅ **Entrance Animations** - Animasi saat elemen pertama kali muncul
- ✅ **Scroll-based Animations** - Animasi yang dipicu saat scroll
- ✅ **Hover & Tap Interactions** - Respons interaktif pada hover dan click
- ✅ **Stagger Animations** - Animasi berurutan untuk multiple elements
- ✅ **Timeline Animations** - Animasi sekuensial untuk timeline
- ✅ **Card Animations** - Animasi khusus untuk komponen card
- ✅ **Page Transitions** - Transisi smooth antar halaman

---

## Teknologi yang Digunakan

### Framer Motion v12.23.24
Framer Motion adalah library animasi production-ready untuk React yang menyediakan:
- API yang sederhana dan deklaratif
- Animasi berbasis gesture (drag, hover, tap)
- Layout animations otomatis
- Scroll-triggered animations
- Server-side rendering support
- TypeScript support lengkap

### Instalasi
```bash
npm install framer-motion
```

---

## Struktur Animasi

### 1. Motion Variants (`utils/motionVariants.ts`)

File ini berisi preset animasi yang dapat digunakan kembali di seluruh aplikasi:

#### Variants yang Tersedia:

**`fadeInUp`** - Fade in dari bawah
```typescript
fadeInUp: {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 }
}
```

**`fadeInLeft`** - Fade in dari kiri
**`fadeInRight`** - Fade in dari kanan
**`scaleIn`** - Scale up dengan fade
**`staggerContainer`** - Container untuk stagger animations
**`staggerItem`** - Item untuk stagger animations
**`hoverScale`** - Effect hover untuk interactive elements
**`tapScale`** - Effect tap untuk buttons
**`slideInBottom`** - Slide in dari bawah (untuk modals)
**`rotateScaleIn`** - Rotate dan scale in
**`pageTransition`** - Page transition variants

### 2. Motion Wrappers (`components/MotionWrappers.tsx`)

Komponen-komponen reusable yang membungkus children dengan animasi:

#### `ScrollReveal`
Reveal content saat scroll dengan custom variants
```tsx
<ScrollReveal variants={fadeInUp} delay={0.2}>
  <YourComponent />
</ScrollReveal>
```

#### `StaggerContainer`
Container untuk animasi berurutan
```tsx
<StaggerContainer staggerDelay={0.15}>
  {items.map(item => (
    <motion.div key={item.id} variants={staggerItem}>
      {item.content}
    </motion.div>
  ))}
</StaggerContainer>
```

#### `AnimatedCard`
Card dengan hover dan entrance animations
```tsx
<AnimatedCard delay={0.1} whileHover>
  <CardContent />
</AnimatedCard>
```

#### `FadeInWhenVisible`
Simple fade in dengan direction
```tsx
<FadeInWhenVisible direction="up" delay={0.2}>
  <Content />
</FadeInWhenVisible>
```

---

## Komponen Animasi

### Hero Section
**Fitur:**
- Stagger animation untuk teks greeting, nama, tagline, dan bio
- Button dengan hover dan tap effects
- Smooth entrance dari atas ke bawah

**Implementasi:**
```tsx
<motion.div 
  initial="hidden"
  animate="visible"
  variants={staggerContainer}
>
  <motion.p variants={staggerItem}>Greeting</motion.p>
  <motion.h1 variants={staggerItem}>Name</motion.h1>
  <motion.h2 variants={staggerItem}>Tagline</motion.h2>
</motion.div>
```

### About Section
**Fitur:**
- Scroll-triggered animations
- Directional fade (left untuk deskripsi, right untuk info)
- Sequential animation untuk list items

**Implementasi:**
```tsx
<ScrollReveal variants={fadeInLeft}>
  <Description />
</ScrollReveal>
<ScrollReveal variants={fadeInRight}>
  <CoreValues />
</ScrollReveal>
```

### Portfolio Cards
**Fitur:**
- Hover lift effect (scale + translateY)
- Stagger animation saat cards muncul
- Icon rotation on hover
- Link animation on hover

**Implementasi:**
```tsx
<AnimatedCard delay={index * 0.1}>
  <CardContent />
</AnimatedCard>
```

### Research Cards
**Fitur:**
- Similar dengan portfolio cards
- Type badge animation
- Link hover effects

### Experience Timeline
**Fitur:**
- Sequential reveal dari kiri
- Timeline dot scale animation
- Stagger delay berdasarkan index

**Implementasi:**
```tsx
<motion.div 
  initial={{ opacity: 0, x: -30 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ delay: index * 0.15 }}
>
  <TimelineItem />
</motion.div>
```

### Contact Section
**Fitur:**
- Center-focused reveal
- Button hover dengan background change
- Stagger untuk heading, text, dan button

### Navbar
**Fitur:**
- Slide down animation saat page load
- Menu items dengan stagger
- Logo hover scale
- Mobile menu slide dari kanan

### Footer
**Fitur:**
- Social icons dengan rotate on hover
- Sequential fade in

---

## Cara Menggunakan

### 1. Menggunakan Motion Variants

Import variants yang dibutuhkan:
```tsx
import { fadeInUp, scaleIn } from '../utils/motionVariants';
```

Terapkan pada komponen:
```tsx
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  variants={fadeInUp}
>
  Your Content
</motion.div>
```

### 2. Menggunakan Motion Wrappers

Import wrapper:
```tsx
import { ScrollReveal, AnimatedCard } from './MotionWrappers';
```

Bungkus komponen Anda:
```tsx
<ScrollReveal variants={fadeInUp}>
  <YourComponent />
</ScrollReveal>
```

### 3. Custom Animation Inline

Untuk kasus khusus, Anda dapat membuat animation inline:
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.6 }}
>
  Custom Animation
</motion.div>
```

### 4. Hover & Tap Effects

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Interactive Button
</motion.button>
```

### 5. Scroll-Triggered Animation

```tsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-100px' }}
>
  Triggered when scrolled into view
</motion.div>
```

---

## Customisasi Animasi

### Mengubah Duration

```tsx
<motion.div
  variants={fadeInUp}
  transition={{ duration: 1.0 }} // Default 0.6s
>
  Slower Animation
</motion.div>
```

### Mengubah Easing

```tsx
<motion.div
  animate={{ x: 100 }}
  transition={{ 
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier
  }}
>
  Custom Easing
</motion.div>
```

### Menambah Delay

```tsx
<motion.div
  variants={fadeInUp}
  transition={{ delay: 0.5 }}
>
  Delayed Animation
</motion.div>
```

### Membuat Variant Baru

Tambahkan di `motionVariants.ts`:
```typescript
export const customFade: Variants = {
  hidden: { 
    opacity: 0,
    // ... custom properties
  },
  visible: { 
    opacity: 1,
    // ... custom properties
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};
```

---

## Best Practices

### 1. **Use Viewport Property untuk Scroll Animations**
```tsx
viewport={{ once: true, margin: '-100px' }}
```
- `once: true` - Animasi hanya terjadi sekali
- `margin` - Trigger animation sebelum element terlihat penuh

### 2. **Gunakan Stagger untuk Lists**
```tsx
<StaggerContainer>
  {items.map(item => (
    <motion.div variants={staggerItem}>
      {item}
    </motion.div>
  ))}
</StaggerContainer>
```

### 3. **Hindari Over-Animation**
- Jangan animasi terlalu banyak elemen sekaligus
- Gunakan animation yang subtle untuk UX yang lebih baik
- Duration sebaiknya 0.3s - 0.8s

### 4. **Optimize untuk Performance**
- Gunakan `transform` dan `opacity` (GPU-accelerated)
- Hindari animasi pada `width`, `height`, `top`, `left`
- Gunakan `will-change` untuk complex animations

### 5. **Accessibility**
```tsx
// Respect user's motion preferences
const shouldReduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;
```

---

## Performance Optimization

### 1. Layout Animations
Framer Motion otomatis optimize layout animations menggunakan FLIP technique.

### 2. GPU Acceleration
Transform dan opacity menggunakan GPU:
```tsx
// Good ✅
transform: translateX(100px)
opacity: 0.5

// Avoid ❌
left: 100px
width: 200px
```

### 3. Lazy Loading Animations
Load animasi hanya saat dibutuhkan:
```tsx
const MotionDiv = lazy(() => 
  import('framer-motion').then(mod => ({ default: mod.motion.div }))
);
```

### 4. Reduce Motion Queries
```tsx
const { shouldReduceMotion } = useReducedMotion();

<motion.div
  animate={shouldReduceMotion ? {} : { x: 100 }}
>
```

---

## Troubleshooting

### Animasi Tidak Muncul

**Cek:**
1. Import Framer Motion sudah benar
2. Variants sudah di-assign
3. `initial` dan `animate` props sudah set
4. Element ada di viewport (untuk whileInView)

### Animasi Terlalu Lambat/Cepat

**Solusi:**
```tsx
transition={{ duration: 0.3 }} // Adjust duration
```

### Animasi Tidak Smooth

**Solusi:**
```tsx
transition={{ 
  ease: [0.22, 1, 0.36, 1] // Custom easing
}}
```

---

## Kesimpulan

Sistem animasi ini dirancang untuk:
- ✅ **Mudah digunakan** - API yang simple dan intuitif
- ✅ **Maintainable** - Reusable components dan variants
- ✅ **Performant** - Optimized untuk production
- ✅ **Flexible** - Mudah di-customize sesuai kebutuhan

Untuk pertanyaan lebih lanjut atau custom animation needs, silakan refer ke [Framer Motion Documentation](https://www.framer.com/motion/).

---

**Made with ❤️ and Framer Motion**
*Updated: Oktober 2025*
