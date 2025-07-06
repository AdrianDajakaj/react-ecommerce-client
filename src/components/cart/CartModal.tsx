import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  MdOutlineRemoveShoppingCart,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdClose,
} from 'react-icons/md';
import type { CartCard } from './Cart';

interface CartModalProps {
  readonly card: CartCard;
  readonly quantity: number;
  readonly minQty: number;
  readonly maxQty: number;
  readonly onClose: (newQty?: number) => void;
  readonly onUpdateQuantity: (cartItemId: number, newQuantity: number) => Promise<void>;
  readonly onRemoveItem: (cartItemId: number) => Promise<void>;
  readonly isUpdating: boolean;
  readonly isRemoving: boolean;
  readonly id: string;
}

export function CartModal({
  card,
  quantity,
  minQty,
  maxQty,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  isUpdating,
  isRemoving,
  id,
}: CartModalProps) {
  const [modalQty, setModalQty] = useState<number>(quantity);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    setModalQty(quantity);
    setHasChanged(false);
  }, [quantity, card.id]);

  const handleQuantityChange = async (newQty: number) => {
    if (newQty === modalQty || isUpdating) return;

    setModalQty(newQty);
    setHasChanged(true);

    try {
      await onUpdateQuantity(card.id, newQty);
    } catch {
      setModalQty(quantity);
      setHasChanged(false);
      // Error is handled by the hook that calls this function
    }
  };

  const handleClose = () => {
    onClose(hasChanged ? modalQty : undefined);
  };

  return (
    <div className="fixed inset-0 grid place-items-center z-[100]">
      <motion.button
        key={`button-${card.name}-${id}`}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        className="absolute top-4 right-4 z-20 flex items-center justify-center rounded-full w-10 h-10 bg-white/80 border border-white/60 shadow-inner text-xl text-neutral-600 dark:text-white transition-colors duration-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer"
        onClick={handleClose}
        aria-label="Zamknij szczegóły"
      >
        <MdClose />
      </motion.button>
      <motion.div
        layoutId={`card-${card.name}-${id}`}
        initial={{ opacity: 0, scale: 0.98, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden rounded-none max-w-full h-auto my-0 mx-0 fixed inset-0 max-h-full md:static md:rounded-3xl md:max-w-[500px] md:w-full md:h-fit md:my-auto md:mx-auto"
      >
        <motion.div layoutId={`image-${card.name}-${id}`}>
          <div className="w-full aspect-[16/9] lg:aspect-[16/9] sm:rounded-tr-lg sm:rounded-tl-lg overflow-hidden">
            <img src={card.src} alt={card.name} className="w-full h-full object-cover object-top" />
          </div>
        </motion.div>
        <div>
          <div className="flex justify-between items-start p-4">
            <div className="">
              <motion.h3
                layoutId={`name-${card.name}-${id}`}
                className="font-bold text-neutral-700 dark:text-neutral-200"
              >
                {card.name}
              </motion.h3>
              <motion.p
                layoutId={`category-${card.category}-${id}`}
                className="text-neutral-600 dark:text-neutral-400"
              >
                {card.category}
              </motion.p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center h-10 px-2 bg-white/80 rounded-full border border-white/60 shadow-inner select-none transition-transform duration-200 ease-in-out hover:scale-105 focus-within:scale-105"
                  style={{ minWidth: '72px' }}
                >
                  <button
                    type="button"
                    className={`text-xl text-neutral-600 dark:text-white px-0.5 focus:outline-none disabled:text-gray-300 ${modalQty > minQty && !isUpdating ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={e => {
                      e.stopPropagation();
                      const newQty = Math.max(minQty, modalQty - 1);
                      if (newQty !== modalQty) {
                        handleQuantityChange(newQty);
                      }
                    }}
                    disabled={modalQty === minQty || isUpdating}
                    aria-label="Zmniejsz ilość"
                  >
                    <MdOutlineKeyboardArrowLeft />
                  </button>
                  <span
                    className="mx-2 text-base font-medium text-neutral-600 dark:text-white w-5 text-center"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {modalQty}
                  </span>
                  <button
                    type="button"
                    className={`text-xl text-neutral-600 dark:text-white px-0.5 focus:outline-none disabled:text-gray-300 ${modalQty < maxQty && !isUpdating ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={e => {
                      e.stopPropagation();
                      const newQty = Math.min(maxQty, modalQty + 1);
                      if (newQty !== modalQty) {
                        handleQuantityChange(newQty);
                      }
                    }}
                    disabled={modalQty === maxQty || isUpdating}
                    aria-label="Zwiększ ilość"
                  >
                    <MdOutlineKeyboardArrowRight />
                  </button>
                </div>
                <button
                  type="button"
                  className={`flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-white/60 shadow-inner text-xl transition-transform duration-200 hover:scale-105 focus:scale-105 cursor-pointer text-neutral-600 dark:text-white hover:text-red-600 dark:hover:text-red-400 ${isRemoving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ zIndex: 1 }}
                  onClick={e => {
                    e.stopPropagation();
                    if (!isRemoving) {
                      onRemoveItem(card.id);
                    }
                  }}
                  disabled={isRemoving}
                  aria-label="Usuń z koszyka"
                >
                  <MdOutlineRemoveShoppingCart />
                </button>
              </div>
              <div className="text-right w-full pr-1">
                <span className="text-lg font-normal text-neutral-700 dark:text-neutral-200">
                  {(card.price * modalQty).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-4 relative px-4">
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
            ></motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
