import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Input = forwardRef(({ label, value, onChange, error = "", type = "text", className = "", ...props }, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-secondary select-none">
          {label}
        </label>
      )}
      <motion.div
        animate={error ? { x: [-6, 6, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="w-full"
      >
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2 bg-input text-primary rounded-lg border focus:outline-none transition-all duration-200 
            ${error 
              ? 'border-status-retired focus:border-status-retired' 
              : 'border-default focus:border-focus focus:ring-1 focus:ring-accent/20'
            }
            input-glow-focus
          `}
          {...props}
        />
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-status-retired font-medium mt-0.5 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
export { Input };
