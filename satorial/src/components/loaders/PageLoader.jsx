import React from "react";
import { motion } from "framer-motion";

const squareVariants = {
  animate: {
    x: [0, 20, -20, 0],
    y: [0, -20, 20, 0],
    transition: {
      repeat: Infinity,
      repeatType: "mirror",
      duration: 0.8,
      ease: "easeInOut",
    },
  },
};

const PageLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            variants={squareVariants}
            animate="animate"
            className="w-6 h-6 bg-blue-500 rounded-md"
          />
        ))}
      </div>
    </div>
  );
};

export default PageLoader;
