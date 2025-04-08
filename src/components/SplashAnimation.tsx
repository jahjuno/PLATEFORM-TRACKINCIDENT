import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashAnimation() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-primary-navy flex items-center justify-center z-50"
        >
          <div className="relative">
            {/* Background glow effect */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 bg-primary-yellow rounded-full blur-3xl"
              style={{ width: '400px', height: '400px', top: '-50%', left: '-50%' }}
            />

            {/* Main content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="relative z-10"
            >
              {/* YAS text */}
              <motion.h1
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-9xl font-bold text-primary-yellow mb-4 tracking-tight"
              >
                YAS
              </motion.h1>

              {/* Team O&M text */}
              <div className="relative">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="text-3xl text-white font-light tracking-widest"
                >
                  Team O&M
                </motion.h2>

                {/* Animated underline */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.5, duration: 1, ease: "easeInOut" }}
                  className="h-0.5 bg-primary-yellow mt-2 origin-left"
                />
              </div>
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="absolute -top-32 -left-32 w-64 h-64 bg-primary-yellow/20 rounded-full blur-2xl"
            />

            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, -180, -360],
              }}
              transition={{
                duration: 4,
                delay: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="absolute -bottom-32 -right-32 w-64 h-64 bg-primary-yellow/20 rounded-full blur-2xl"
            />

            {/* Additional decorative circles */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.2 }}
              transition={{ delay: 0.8, duration: 1.5 }}
              className="absolute top-0 right-0 w-40 h-40 bg-primary-yellow rounded-full blur-xl"
            />

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.15 }}
              transition={{ delay: 1.2, duration: 1.5 }}
              className="absolute -bottom-16 left-0 w-32 h-32 bg-primary-yellow rounded-full blur-xl"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}