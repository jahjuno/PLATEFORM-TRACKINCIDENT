import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SplashAnimation() {
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTextVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-primary-navy flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-8xl font-bold mb-4">
            <span className="text-primary-yellow">YAS</span>
          </h1>
          <div className="relative">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="text-2xl text-white"
            >
              Team O&M
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="h-1 bg-primary-yellow mt-2 origin-left"
            />
          </div>
        </motion.div>

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute -top-16 -left-16 w-32 h-32 bg-primary-yellow/20 rounded-full blur-xl"
        />

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 2,
            delay: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute -bottom-16 -right-16 w-32 h-32 bg-primary-yellow/20 rounded-full blur-xl"
        />
      </motion.div>
    </div>
  );
}