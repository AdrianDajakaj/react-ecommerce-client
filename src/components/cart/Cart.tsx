import { useEffect, useId, useRef, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useUpdateCart } from "@/hooks/useUpdateCart";
import { useRemoveFromCart } from "@/hooks/useRemoveFromCart";
import { useMakeOrder } from "@/hooks/useMakeOrder";
import { API_BASE_URL } from "@/config";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { MdOutlineRemoveShoppingCart, MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight, MdClose, MdShoppingCartCheckout } from "react-icons/md";
import { FaApple } from "react-icons/fa";
import { CartModal } from "./CartModal";

export interface CartCard {
  id: number;
  product_id: number;
  quantity: number;
  subtotal: number;
  name: string;
  category: string;
  src: string;
  price: number;
}



export type PaymentMethod = "CARD" | "BLIK" | "PAYPAL" | "PAYPO" | "GOOGLE_PAY" | "APPLE_PAY" | "ONLINE_TRANSFER";

interface PaymentButtonProps {
  label: string;
  method: PaymentMethod;
  icon: React.ReactNode;
  onSelect: (method: PaymentMethod) => void;
}

const PaymentButton: React.FC<PaymentButtonProps & { selected?: boolean }> = ({ label, method, icon, onSelect, selected }) => {
  return (
    <button
      type="button"
      className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-base shadow focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 cursor-pointer transition-colors duration-200 ${
        selected
          ? 'bg-emerald-600 text-white dark:bg-emerald-700'
          : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-700'
      }`}
      style={{ minHeight: 44 }}
      onClick={() => onSelect(method)}
      aria-pressed={selected}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
      {selected && (
        <span className="ml-auto text-emerald-300 text-lg">●</span>
      )}
    </button>
  );
};

export default function Cart() {
  const [active, setActive] = useState<CartCard | boolean | null>(null);
  const { cart, loading: cartLoading, error: cartError, refreshCart } = useCart();
  const { updateCartItem } = useUpdateCart();
  const { removeFromCart } = useRemoveFromCart();
  const { makeOrder, loading: orderLoading, error: orderError, success: orderSuccess, resetSuccess } = useMakeOrder();
  const [cards, setCards] = useState<CartCard[]>([]);
  const [quantities, setQuantities] = useState<number[]>([]);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [removingItems, setRemovingItems] = useState<Set<number>>(new Set());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (showPaymentModal) {
      setSelectedPayment(null);
    }
  }, [showPaymentModal]);

  useEffect(() => {
    if (orderSuccess) {
      setShowPaymentModal(false);
      setSelectedPayment(null);
      setCards([]);
      setQuantities([]);
      setShowSuccessMessage(true);
      refreshCart();
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        resetSuccess(); 
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [orderSuccess, refreshCart, resetSuccess]);

  useEffect(() => {
    if (orderError) {
      console.error('Order error:', orderError);
      alert(`Error placing order: ${orderError}`);
    }
  }, [orderError]);

  const handlePlaceOrder = async () => {
    if (!selectedPayment) return;
    
    try {
      await makeOrder(selectedPayment);
    } catch (error) {
      console.error('Failed to place order:', error);
    }
  };

  useEffect(() => {
    if (!cartLoading && cart) {
      const fetchAll = async () => {
        const results = await Promise.all(
          cart.items.map(async (item) => {
            try {
              const res = await fetch(`${API_BASE_URL}/products/${item.product.id}`);
              if (!res.ok) throw new Error("Failed to fetch product");
              const json = await res.json();
              let src = "";
              if (Array.isArray(json.images) && json.images.length > 0 && json.images[0].url) {
                src = `${API_BASE_URL.replace(/\/$/, "")}/${json.images[0].url.replace(/^\//, "")}`;
              }
              return {
                id: item.id,
                product_id: item.product.id,
                quantity: item.quantity,
                subtotal: item.subtotal,
                name: json.name,
                category: json.category?.name ?? "",
                src,
                price: json.price,
              };
            } catch (err) {
              return {
                id: item.id,
                product_id: item.product.id,
                quantity: item.quantity,
                subtotal: item.subtotal,
                name: "",
                category: "",
                src: "",
                price: 0,
                error: (err instanceof Error ? err.message : "Unknown error"),
              };
            }
          })
        );
        function isCartCard(obj: unknown): obj is CartCard {
          return obj != null && typeof obj === 'object' && !('error' in obj);
        }
        const validCards = results.filter(isCartCard);
        setCards(validCards);
        setQuantities(validCards.map((c) => c.quantity ?? 1));
      };
      fetchAll();
    } else if (!cartLoading && cartError) {
      setCards([]);
      setQuantities([]);
    }
  }, [cart, cartLoading, cartError]);
  const ref = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const id = useId();
  const minQty = 1;
  const maxQty = 10;

  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    const cardIndex = cards.findIndex(c => c.id === cartItemId);
    if (cardIndex === -1) return;

    setQuantities(qs => qs.map((q, i) => i === cardIndex ? newQuantity : q));
    
    setUpdatingItems(prev => new Set(prev).add(cartItemId));

    try {
      await updateCartItem(cartItemId, newQuantity);
    } catch (error) {
      setQuantities(qs => qs.map((q, i) => i === cardIndex ? cards[cardIndex].quantity : q));
      console.error('Failed to update cart item:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const removeItem = async (cartItemId: number) => {
    setRemovingItems(prev => new Set(prev).add(cartItemId));

    try {
      await removeFromCart(cartItemId);
      
      const cardIndex = cards.findIndex(c => c.id === cartItemId);
      if (cardIndex !== -1) {
        setCards(prevCards => prevCards.filter(c => c.id !== cartItemId));
        setQuantities(prevQty => prevQty.filter((_, i) => i !== cardIndex));
      }
      
      if (active && typeof active === "object" && active.id === cartItemId) {
        setActive(null);
      }
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  const handleCardClick = (card: CartCard) => {
    if (active) {
      setActive(null);
      setTimeout(() => setActive(card), 100);
    } else {
      setActive(card);
    }
  };

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-500 ease-out"
            style={{ pointerEvents: 'auto' }}
            onClick={() => setActive(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {active && typeof active === "object" ? (
          <CartModal
            key={`modal-${(active as CartCard).id}`}
            card={active as CartCard}
            quantity={quantities[cards.findIndex((c) => c.id === (active as CartCard).id)] ?? 1}
            minQty={minQty}
            maxQty={maxQty}
            onClose={(newQty?: number) => {
              if (newQty !== undefined) {
                const idx = cards.findIndex((c) => c.id === (active as CartCard).id);
                if (idx !== -1) {
                  setQuantities(qs => qs.map((q, i) => i === idx ? newQty : q));
                }
              }
              setActive(null);
            }}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            isUpdating={updatingItems.has((active as CartCard).id)}
            isRemoving={removingItems.has((active as CartCard).id)}
            id={id}
          />
        ) : null}
      </AnimatePresence>

      <motion.ul 
        className="max-w-2xl mx-auto w-full gap-4 px-2 sm:px-4"
        layout
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {cards.length === 0 ? (
          <li className="w-full flex flex-col items-center justify-center py-16">
            {showSuccessMessage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <span className="text-lg text-green-600 dark:text-green-400 font-semibold">Order placed successfully!</span>
                <span className="text-base text-green-500 dark:text-green-300 mt-2">Order details will be sent to your email.</span>
              </motion.div>
            ) : (
              <>
                <span className="text-lg text-neutral-500 dark:text-neutral-400 font-medium">Your cart is empty</span>
                <span className="text-base text-neutral-400 dark:text-neutral-500 mt-2">No products have been added yet.</span>
              </>
            )}
          </li>
        ) : (
          cards.map((card: CartCard, idx: number) => (
            <motion.div
              layoutId={`card-${card.name}-${id}`}
              key={`card-${card.name}-${id}`}
              onClick={() => handleCardClick(card)}
              className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
            >
              <div className="flex gap-4 flex-col md:flex-row ">
                <motion.div layoutId={`image-${card.name}-${id}`}> 
                  <div className="w-40 aspect-[16/9] md:w-28 md:aspect-[16/9] rounded-lg overflow-hidden">
                    <img
                      src={card.src}
                      alt={card.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </motion.div>
                <div className="">
                  <motion.h3
                    layoutId={`name-${card.name}-${id}`}
                    className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                  >
                    {card.name}
                  </motion.h3>
                  <motion.p
                    layoutId={`category-${card.category}-${id}`}
                    className="text-neutral-600 dark:text-neutral-400 text-center md:text-left"
                  >
                    {card.category}
                  </motion.p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 mt-4 md:mt-0">
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center h-10 px-2 bg-white/80 rounded-full border border-white/60 shadow-inner select-none transition-transform duration-200 ease-in-out hover:scale-105 focus-within:scale-105"
                    style={{ minWidth: '72px' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className={`text-xl text-neutral-600 dark:text-white px-0.5 focus:outline-none disabled:text-gray-300 ${quantities[idx] > minQty && !updatingItems.has(card.id) ? 'cursor-pointer' : 'cursor-default'}`}
                      onClick={e => { 
                        e.stopPropagation(); 
                        const newQty = Math.max(minQty, quantities[idx] - 1);
                        if (newQty !== quantities[idx]) {
                          updateQuantity(card.id, newQty);
                        }
                      }}
                      disabled={quantities[idx] === minQty || updatingItems.has(card.id)}
                      aria-label="Zmniejsz ilość"
                    >
                      <MdOutlineKeyboardArrowLeft />
                    </button>
                    <span className="mx-2 text-base font-medium text-neutral-600 dark:text-white w-5 text-center" style={{ fontVariantNumeric: 'tabular-nums' }}>{quantities[idx]}</span>
                    <button
                      type="button"
                      className={`text-xl text-neutral-600 dark:text-white px-0.5 focus:outline-none disabled:text-gray-300 ${quantities[idx] < maxQty && !updatingItems.has(card.id) ? 'cursor-pointer' : 'cursor-default'}`}
                      onClick={e => { 
                        e.stopPropagation(); 
                        const newQty = Math.min(maxQty, quantities[idx] + 1);
                        if (newQty !== quantities[idx]) {
                          updateQuantity(card.id, newQty);
                        }
                      }}
                      disabled={quantities[idx] === maxQty || updatingItems.has(card.id)}
                      aria-label="Zwiększ ilość"
                    >
                      <MdOutlineKeyboardArrowRight />
                    </button>
                  </div>
                  <button
                    type="button"
                    layout-id={`button-${card.name}-${id}`}
                    className={`flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-white/60 shadow-inner text-xl transition-transform duration-200 hover:scale-105 focus:scale-105 cursor-pointer text-neutral-600 dark:text-white hover:text-red-600 dark:hover:text-red-400 ${removingItems.has(card.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ zIndex: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!removingItems.has(card.id)) {
                        removeItem(card.id);
                      }
                    }}
                    disabled={removingItems.has(card.id)}
                    aria-label="Usuń z koszyka"
                  >
                    <MdOutlineRemoveShoppingCart />
                  </button>
                </div>
                <div className="text-right w-full pr-1">
                  <span className="text-lg font-normal text-neutral-700 dark:text-neutral-200">
                    {(card.price * quantities[idx]).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
        {cards.length > 0 && (
          <>
            <div className="w-full h-px mt-8 mb-2 bg-neutral-700 dark:bg-neutral-200 opacity-70" />
            <div className="w-full flex items-center justify-between mt-2 gap-2 px-2 sm:px-4">
              <button
                type="button"
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 cursor-pointer hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 transform-gpu hover:scale-105"
                style={{
                  minWidth: 150,
                  transitionProperty: 'background, color, box-shadow, transform',
                  transitionDuration: '600ms',
                  transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                onClick={() => setShowPaymentModal(true)}
              >
                <MdShoppingCartCheckout className="text-xl" />
                Place order
              </button>
              <div className="flex items-center gap-2 pl-1">
                <span className="text-base font-normal text-neutral-600 dark:text-neutral-400">Total amount due</span>
                <span className="text-xl font-normal text-neutral-700 dark:text-neutral-200">
                  {quantities.reduce((sum, qty, i) => sum + qty * cards[i].price, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </span>
              </div>
            </div>
          </>
        )}

        <AnimatePresence>
          {showPaymentModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-500 ease-out"
                style={{ pointerEvents: 'auto' }}
                onClick={() => setShowPaymentModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-[100] flex items-center justify-center"
                style={{ pointerEvents: 'none' }}
              >
                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6 w-full max-w-xs mx-auto flex flex-col gap-4 relative" style={{ pointerEvents: 'auto' }}>
                  <button
                    className="absolute top-3 right-3 flex items-center justify-center rounded-full w-8 h-8 bg-white/80 border border-white/60 shadow-inner text-lg text-neutral-600 dark:text-white transition-colors duration-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer"
                    onClick={() => setShowPaymentModal(false)}
                    aria-label="Close payment method menu"
                  >
                    <MdClose />
                  </button>
                  <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-2 text-center">Choose payment method</h2>
                  <div className="flex flex-col gap-3">
                    <PaymentButton label="Card" method="CARD" icon="💳" onSelect={m => setSelectedPayment(m)} selected={selectedPayment === 'CARD'} />
                    <PaymentButton label="BLIK" method="BLIK" icon={<img src="/blik_logo.png" alt="BLIK" className="h-5 w-auto" style={{maxHeight: 20, maxWidth: 60, objectFit: 'contain'}} />} onSelect={m => setSelectedPayment(m)} selected={selectedPayment === 'BLIK'} />
                    <PaymentButton label="PayPal" method="PAYPAL" icon={<img src="/paypal_logo.png" alt="PayPal" className="h-5 w-auto" style={{maxHeight: 20, maxWidth: 60, objectFit: 'contain'}} />} onSelect={m => setSelectedPayment(m)} selected={selectedPayment === 'PAYPAL'} />
                    <PaymentButton label="PayPo" method="PAYPO" icon={<img src="/paypo_logo.png" alt="PayPo" className="h-5 w-auto" style={{maxHeight: 20, maxWidth: 60, objectFit: 'contain'}} />} onSelect={m => setSelectedPayment(m)} selected={selectedPayment === 'PAYPO'} />
                    <PaymentButton label="Google Pay" method="GOOGLE_PAY" icon={<img src="/gpay_logo.png" alt="Google Pay" className="h-5 w-auto" style={{maxHeight: 20, maxWidth: 60, objectFit: 'contain'}} />} onSelect={m => setSelectedPayment(m)} selected={selectedPayment === 'GOOGLE_PAY'} />
                    <PaymentButton label="Apple Pay" method="APPLE_PAY" icon={<FaApple className="text-xl" />} onSelect={m => setSelectedPayment(m)} selected={selectedPayment === 'APPLE_PAY'} />
                    <PaymentButton label="Online transfer" method="ONLINE_TRANSFER" icon="🏦" onSelect={m => setSelectedPayment(m)} selected={selectedPayment === 'ONLINE_TRANSFER'} />
                  </div>
                  {selectedPayment && (
                    <div className="flex w-full mt-4">
                      <button
                        type="button"
                        className={`flex items-center gap-2 px-5 py-2 rounded-full text-white font-semibold text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 w-full justify-center transition-all duration-300 ${
                          orderLoading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-green-600 to-emerald-700 cursor-pointer hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 transform-gpu hover:scale-105'
                        }`}
                        style={{
                          minWidth: 150,
                          transitionProperty: 'background, color, box-shadow, transform',
                          transitionDuration: '600ms',
                          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                        onClick={handlePlaceOrder}
                        disabled={orderLoading}
                      >
                        <MdShoppingCartCheckout className="text-xl" />
                        {orderLoading ? 'Processing...' : 'Place order'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.ul>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};


