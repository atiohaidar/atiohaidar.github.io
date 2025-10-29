/**
 * @file Reusable motion wrapper components untuk scroll animations
 * Komponen-komponen ini membungkus children dengan Framer Motion untuk animasi otomatis
 */

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import type { Variants } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  variants?: Variants;
  delay?: number;
  className?: string;
  once?: boolean;
}

/**
 * Komponen untuk reveal content saat scroll dengan custom variants
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
  children, 
  variants,
  delay = 0,
  className = '',
  once = true 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once,
    margin: '-100px' // Trigger saat element masih 100px dari viewport
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  once?: boolean;
}

/**
 * Container untuk stagger animations pada children
 */
export const StaggerContainer: React.FC<StaggerContainerProps> = ({ 
  children, 
  staggerDelay = 0.15,
  className = '',
  once = true
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-50px' });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  whileHover?: boolean;
  delay?: number;
}

/**
 * Card dengan hover dan entrance animations
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  className = '',
  whileHover = true,
  delay = 0
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={cardVariants}
      whileHover={whileHover ? { 
        scale: 1.03,
        y: -5,
        transition: { 
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1]
        }
      } : undefined}
      whileTap={whileHover ? { scale: 0.98 } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface FadeInWhenVisibleProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
  once?: boolean;
}

/**
 * Simple fade in dengan direction saat element visible
 */
export const FadeInWhenVisible: React.FC<FadeInWhenVisibleProps> = ({ 
  children, 
  direction = 'up',
  delay = 0,
  className = '',
  once = true
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-80px' });

  const directionOffset = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 }
  };

  const variants: Variants = {
    hidden: { 
      opacity: 0,
      ...directionOffset[direction]
    },
    visible: { 
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
