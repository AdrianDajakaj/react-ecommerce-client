import { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';

export interface ModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly children?: React.ReactNode;
}

export const Modal = ({ open, onClose, children }: ModalProps) => {
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      setIsMounted(true);
      requestAnimationFrame(() => setIsVisible(true));
      document.addEventListener('keydown', handleEscape);
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setIsMounted(false), 500);
      document.removeEventListener('keydown', handleEscape);
      return () => {
        clearTimeout(t);
        document.removeEventListener('keydown', handleEscape);
      };
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!isMounted) return null;

  return (
    <dialog
      open={open}
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
      className={`
        fixed inset-0 z-50
        bg-black/40 dark:bg-black/80
        backdrop-filter backdrop-blur-xl
        transition-opacity duration-500 ease-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        overflow-y-auto
        flex justify-center items-start py-20
        overflow-hidden
        border-0 outline-0
        w-screen h-screen
      `}
    >
      <div 
        className="absolute inset-0 w-full h-full"
        onClick={e => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        role="none"
      >
      </div>
      <div className="relative mt-5">
        <button
          onClick={onClose}
          className={`
    absolute -top-20 right-0
    w-10 h-10
    bg-white dark:bg-gray-800
    border border-gray-200 dark:border-gray-700
    rounded-full
    flex items-center justify-center
    shadow-md
    hover:scale-110 transition-transform
    cursor-pointer
    z-30
    duration-300
    ${!isVisible ? 'opacity-0' : 'opacity-100'}
  `}
        >
          <span
            className="
    text-gray-600 dark:text-gray-300 
    font-bold select-none
    transition-colors duration-1000 ease-in-out
    hover:text-red-500 dark:hover:text-red-400  
  "
          >
            <MdClose className="text-xl" />
          </span>
        </button>
        <div
          className={`
            bg-white dark:bg-gray-800
            rounded-2xl
            w-[95vw] sm:w-full max-w-4xl
            h-auto max-h-[90vh]
            overflow-y-auto
            p-6
            shadow-lg
            transform-gpu transition-all duration-500 ease-out
            ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
            z-20
            custom-scrollbar
            will-change-transform
          `}
        >
          <div className="flex flex-col h-full">{children}</div>
        </div>
      </div>
    </dialog>
  );
};

export default Modal;
