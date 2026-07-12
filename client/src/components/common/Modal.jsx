import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-default bg-card p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-default pb-4 mb-4 select-none">
              <h3 className="text-base font-semibold text-primary">{title}</h3>
              <button
                onClick={onClose}
                className="text-muted hover:text-primary rounded-md p-1 transition-colors focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>
            <div className="text-sm text-secondary">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
export { Modal };
