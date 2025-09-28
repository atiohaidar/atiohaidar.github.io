/**
 * @file Utility functions untuk animasi dan timing
 */

/**
 * Delay values untuk berbagai komponen animasi
 */
export const ANIMATION_DELAYS = {
  HERO: {
    GREETING: 200,
    NAME: 400,
    TAGLINE: 600,
    BIO: 800,
    CTA: 1000,
  },
  SECTIONS: {
    ABOUT: 800,
    RESEARCH: 1200,
    PORTFOLIO: 1600,
    EXPERIENCE: 2000,
    CONTACT: 2400,
  },
  SOCIAL_FAB: {
    GITHUB: 100,
    LINKEDIN: 150,
    INSTAGRAM: 200,
    LINE: 300,
  },
} as const;

import * as React from 'react';

/**
 * Membuat style object untuk animasi CSS dengan delay
 */
export const createAnimationStyle = (delay: number, opacity: number = 0): React.CSSProperties => ({
  animation: `fadeInUp 0.5s ease-out ${delay}ms forwards`,
  opacity,
});

/**
 * CSS class names untuk animasi yang umum digunakan
 */
export const ANIMATION_CLASSES = {
  FADE_IN_UP: 'animate-fade-in-up',
  OPACITY_ZERO: 'opacity-0',
  TRANSITION_ALL: 'transition-all',
  DURATION_300: 'duration-300',
  DURATION_500: 'duration-500',
} as const;