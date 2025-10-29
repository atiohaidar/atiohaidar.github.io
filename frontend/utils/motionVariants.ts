/**
 * @file Motion variants untuk Framer Motion animations
 * Koleksi reusable animation presets untuk konsistensi di seluruh aplikasi
 */

import { Variants } from 'framer-motion';

/**
 * Fade in dari bawah dengan smooth transition
 */
export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 60,
    transition: {
      duration: 0.3
    }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] // Custom easing untuk smooth motion
    }
  }
};

/**
 * Fade in dari kanan (untuk side elements)
 */
export const fadeInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 60 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

/**
 * Fade in dari kiri
 */
export const fadeInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -60 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

/**
 * Scale up dengan fade in (untuk cards dan buttons)
 */
export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

/**
 * Container untuk stagger children animations
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

/**
 * Item untuk stagger animations
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

/**
 * Hover effect untuk interactive elements (cards, buttons)
 */
export const hoverScale = {
  scale: 1.05,
  transition: {
    duration: 0.3,
    ease: [0.22, 1, 0.36, 1]
  }
};

/**
 * Tap effect untuk buttons
 */
export const tapScale = {
  scale: 0.95
};

/**
 * Smooth fade in (simple)
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

/**
 * Slide in from bottom (untuk modals atau overlays)
 */
export const slideInBottom: Variants = {
  hidden: { 
    y: '100%',
    opacity: 0
  },
  visible: { 
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

/**
 * Rotate and scale in (untuk icons atau special elements)
 */
export const rotateScaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0,
    rotate: -180
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

/**
 * Drawing line animation (untuk borders atau underlines)
 */
export const drawLine: Variants = {
  hidden: { 
    pathLength: 0,
    opacity: 0
  },
  visible: { 
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { 
        duration: 1.5,
        ease: 'easeInOut'
      },
      opacity: { 
        duration: 0.3 
      }
    }
  }
};

/**
 * Page transition variants
 */
export const pageTransition: Variants = {
  initial: { 
    opacity: 0,
    y: 20
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

/**
 * Float animation (untuk floating elements seperti icons)
 */
export const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

/**
 * Pulse animation (untuk attention-grabbing elements)
 */
export const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};
