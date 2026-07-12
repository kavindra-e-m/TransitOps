import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', disabled = false, onClick, type = 'button', className = '' }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 select-none";
  
  const variants = {
    primary: "bg-accent hover:bg-accent-hover text-[#0B0E14] shadow-lg shadow-accent/10 border border-transparent",
    secondary: "bg-transparent border border-default text-primary hover:border-text-secondary hover:text-primary"
  };

  const disabledStyle = "opacity-40 cursor-not-allowed pointer-events-none";

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`${baseStyle} ${variants[variant]} ${disabled ? disabledStyle : ''} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default Button;
export { Button };
