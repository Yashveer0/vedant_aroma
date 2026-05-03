import { Variants } from 'framer-motion';

/**
 * Fades in the element from the bottom.
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.45, 
      ease: 'easeOut' 
    } 
  }
};

/**
 * A container variant that staggers the animation of its children.
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08, // Thoda sa delay badhaya hai
    }
  }
};

/**
 * An object to be used with the `whileHover` prop.
 * Lifts the element and adds a shadow.
 */
export const hoverLift = {
  whileHover: { 
    y: -6, 
    boxShadow: '0 12px 30px rgba(2, 6, 23, 0.12)',
    transition: { duration: 0.2 }
  },
};

/**
 * Slides in an element from the left.
 */
export const slideInLeft: Variants = {
  hidden: {
    x: '-100%',
    opacity: 0,
  },
  visible: {
    x: '0%',
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 30,
    },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

/**
 * A simple pulsing opacity animation for skeletons.
 */
export const skeletonPulse: Variants = {
  initial: { opacity: 0.7 },
  animate: {
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ==============================================================
// == YEH HAI NAYA ANIMATION JISKI WAJAH SE ERROR AA RAHA THA ==
// ==============================================================
/**
 * Fades and scales in an element from the bottom.
 * A slightly more dynamic version of fadeInUp.
 */
export const scaleInUp: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
};