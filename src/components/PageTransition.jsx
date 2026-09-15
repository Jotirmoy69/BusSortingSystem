import { motion } from "framer-motion";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 14,
    scale: 0.985,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 340,
      damping: 32,
      mass: 0.8,
      staggerChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.985,
    transition: {
      duration: 0.18,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const PageTransition = ({ children }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;


