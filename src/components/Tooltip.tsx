'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  text: string;
  children: React.ReactElement;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      {React.cloneElement(children, {
        onMouseEnter: () => setIsVisible(true),
        onMouseLeave: () => setIsVisible(false),
      })}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm tooltip dark:bg-gray-700 w-64 max-w-xs"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;