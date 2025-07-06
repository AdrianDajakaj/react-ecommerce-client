import { useState, useRef, useEffect } from 'react';
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlineAddShoppingCart,
  MdOutlineCheck,
} from 'react-icons/md';
import { useAddToCart } from '@/hooks/useAddToCart';

/*
 * ModalContent component that displays product details in a modal with image carousel,
 * quantity selection, and add to cart functionality.
 *
 * @param {Object} props - The component props.
 * @param {boolean} [props.isLoggedIn=true] - Indicates if the user is logged in.
 * @param {string} [props.productname] - The name of the product.
 * @param {number} props.unitprice - The unit price of the product.
 * @param {string[]} props.images - Array of image URLs for the product.
 * @param {string} props.description - Description of the product.
 * @param {number} props.productId - ID of the product.
 * @returns {JSX.Element} The rendered ModalContent component.
 */
interface ModalContentProps {
  readonly isLoggedIn?: boolean;
  readonly productname?: string;
  readonly unitprice: number;
  readonly images: string[];
  readonly description: string;
  readonly productId: number;
}

export const ModalContent = ({ isLoggedIn = true, productname, unitprice, images, description, productId }: ModalContentProps) => {
  const [current, setCurrent] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const SWIPE_THRESHOLD = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
  };

  const onTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    if (distance > SWIPE_THRESHOLD && current < images.length - 1) {
      setCurrent(c => c + 1);
    } else if (distance < -SWIPE_THRESHOLD && current > 0) {
      setCurrent(c => c - 1);
    }
  };

  const [quantity, setQuantity] = useState(1);
  const minQty = 1;
  const maxQty = 10;
  const totalPrice = (unitprice * quantity).toFixed(2);

  // Hook for adding to cart
  const { loading: addLoading, error: addError, success: addSuccess, addToCart } = useAddToCart();
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (addSuccess) {
      setShowCheck(true);
      const timer = setTimeout(() => setShowCheck(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [addSuccess]);

  const getAddToCartButtonClass = () => {
    const baseClass = 'flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-white/60 shadow-inner text-xl transition-transform';
    
    if (isLoggedIn && !addLoading && !showCheck) {
      return `${baseClass} hover:scale-105 focus:scale-105 cursor-pointer text-neutral-600 dark:text-white`;
    }
    
    if (showCheck) {
      return `${baseClass} bg-green-100 border-green-400 text-green-700`;
    }
    
    return `${baseClass} cursor-default text-gray-300 opacity-60`;
  };

  return (
    <div className="flex flex-col sm:flex-row h-full">
      <div className="w-full sm:w-1/2 flex flex-col items-center p-4">
        <div
          className="relative w-full h-64 overflow-hidden rounded-xl group"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img
            src={images[current]}
            alt={`slide-${current}`}
            className="w-full h-full object-cover"
          />
          {current > 0 && (
            <button
              onClick={() => setCurrent(c => c - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out cursor-pointer z-10"
            >
              <span className="text-2xl text-gray-700 dark:text-gray-200 select-none">‹</span>
            </button>
          )}
          {current < images.length - 1 && (
            <button
              onClick={() => setCurrent(c => c + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out cursor-pointer z-10"
            >
              <span className="text-2xl text-gray-700 dark:text-gray-200 select-none">›</span>
            </button>
          )}
        </div>
        <div className="flex space-x-2 mt-3">
          {images.map((image, idx) => (
            <button
              key={`image-dot-${image}-${idx}`}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full transition cursor-pointer ${
                idx === current ? 'bg-gray-800 dark:bg-gray-200' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
        <div className="mt-4 w-full flex justify-between px-4 items-center">
          <div
            className="flex items-center justify-center h-8 px-2 bg-white/80 rounded-full border border-white/60 shadow-inner select-none transition-transform duration-200 ease-in-out hover:scale-105 focus-within:scale-105"
            style={{ minWidth: '72px' }}
          >
            <button
              type="button"
              className={`text-xl text-neutral-600 dark:text-white px-0.5 focus:outline-none disabled:text-gray-300 ${quantity > minQty ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => setQuantity(q => Math.max(minQty, q - 1))}
              disabled={quantity === minQty}
              aria-label="Zmniejsz ilość"
            >
              <MdOutlineKeyboardArrowLeft />
            </button>
            <span
              className="mx-2 text-base font-medium text-neutral-600 dark:text-white w-5 text-center"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {quantity}
            </span>
            <button
              type="button"
              className={`text-xl text-neutral-600 dark:text-white px-0.5 focus:outline-none disabled:text-gray-300 ${quantity < maxQty ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
              disabled={quantity === maxQty}
              aria-label="Zwiększ ilość"
            >
              <MdOutlineKeyboardArrowRight />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-neutral-600 dark:text-white select-none min-w-[64px] text-right">
              ${totalPrice}
            </span>
            <button
              className={getAddToCartButtonClass()}
              aria-label="Dodaj do koszyka"
              disabled={!isLoggedIn || addLoading || showCheck}
              onClick={async () => {
                if (!isLoggedIn || addLoading || showCheck) return;
                await addToCart(productId, quantity);
              }}
            >
              {showCheck ? (
                <MdOutlineCheck className="text-green-600" />
              ) : (
                <MdOutlineAddShoppingCart />
              )}
            </button>
            {addError && <span className="ml-2 text-xs text-red-500">{addError}</span>}
          </div>
        </div>
      </div>

      <div className="w-full sm:w-1/2 p-4 flex flex-col h-full relative">
        <div className="relative flex-1 overflow-hidden rounded-md">
          <div ref={scrollContainerRef} className="overflow-y-auto h-full pr-2 custom-scrollbar">
            <div className="space-y-6 divide-y divide-gray-200 dark:divide-gray-700 p-2 pb-24">
              <div className="pb-4">
                <h2 className="text-2xl font-semibold">{productname}</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">From ${unitprice}</p>
              </div>
              {description.split('\n').map((desc, idx) => (
                <div className="pt-4 pb-4" key={`desc-${desc.slice(0, 20)}-${idx}`}>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalContent;
