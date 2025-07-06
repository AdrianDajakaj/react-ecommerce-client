import { CardBody, CardContainer, CardItem } from './Card';
import { Modal } from './Modal';
import ModalContent from './ModalContent';
import { useState, useEffect } from 'react';
import { useAddToCart } from '@/hooks/useAddToCart';
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlineAddShoppingCart,
  MdOutlineCheck,
} from 'react-icons/md';

/*
 * ProductComponent that displays product details in a card format with an image carousel,
 * quantity selection, and add to cart functionality.
 *
 * @param {Object} props - The component props.
 * @param {boolean} [props.isLoggedIn=true] - Indicates if the user is logged in.
 * @param {string} props.category - The category of the product.
 * @param {string} props.productname - The name of the product.
 * @param {string[]} props.images - Array of image URLs for the product.
 * @param {number} props.unitprice - The unit price of the product.
 * @param {number} [props.maxQty=10] - Maximum quantity allowed for the product.
 * @param {string} props.description - Description of the product.
 * @param {number} props.productId - ID of the product.
 * @returns {JSX.Element} The rendered ProductComponent.
 */
export function ProductComponent({
  isLoggedIn = true,
  category,
  productname,
  images,
  unitprice,
  maxQty = 10,
  description,
  productId,
}: {
  isLoggedIn?: boolean;
  category: string;
  productname: string;
  images: string[];
  unitprice: number;
  maxQty?: number;
  description: string;
  productId: number;
}) {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleProductClick = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  console.log(isModalOpen);
  const [quantity, setQuantity] = useState(1);
  const { loading: addLoading, error: addError, success: addSuccess, addToCart } = useAddToCart();
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (addSuccess) {
      setShowCheck(true);
      const timer = setTimeout(() => setShowCheck(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [addSuccess]);

  const minQty = 1;
  const totalPrice = (unitprice * quantity).toFixed(2);
  return (
    <>
      <CardContainer className="inter-var cursor-pointer">
        <CardBody
          className="relative group/card flex flex-col
  w-full h-full rounded-2xl p-6
  bg-white/20 dark:bg-gray-50/10
  border border-white/30 dark:border-gray-300/20
  backdrop-filter backdrop-blur-lg
  shadow-md
  transition"
          onClick={handleProductClick}
        >
          <CardItem translateZ="50" className="text-xl font-bold text-neutral-600 dark:text-white">
            {category}
          </CardItem>
          <CardItem
            as="p"
            translateZ="60"
            className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
          >
            {productname}
          </CardItem>
          <CardItem translateZ={100} className="w-full mt-4 flex-1">
            <div className="h-full w-full rounded-xl overflow-hidden">
              <img
                src={images[0]}
                height="1000"
                width="1000"
                className="
                    h-full w-full object-cover
                    transition-transform duration-1500 ease-in-out
                    group-hover/card:scale-130
                "
                alt="thumbnail"
              />
            </div>
          </CardItem>

          <div className="flex justify-between items-center mt-20 gap-2">
            <div className="flex flex-col items-start">
              <div
                className="flex items-center justify-center h-8 px-2 bg-white/80 rounded-full border border-white/60 shadow-inner ml-2 select-none transition-transform duration-200 ease-in-out hover:scale-105 focus-within:scale-105"
                style={{ minWidth: '72px' }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  type="button"
                  className={`text-xl text-neutral-600 dark:text-white px-0.5 focus:outline-none disabled:text-gray-300 ${quantity > minQty ? 'cursor-pointer' : 'cursor-default'}`}
                  onClick={e => {
                    e.stopPropagation();
                    setQuantity(q => Math.max(minQty, q - 1));
                  }}
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
                  onClick={e => {
                    e.stopPropagation();
                    setQuantity(q => Math.min(maxQty, q + 1));
                  }}
                  disabled={quantity === maxQty}
                  aria-label="Zwiększ ilość"
                >
                  <MdOutlineKeyboardArrowRight />
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-base font-medium text-neutral-600 dark:text-white select-none min-w-[64px] text-right">
                ${totalPrice}
              </span>
              <CardItem
                translateZ={20}
                as="button"
                className={`flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-white/60 shadow-inner mr-2 text-xl transition-transform ${isLoggedIn && !addLoading && !showCheck ? 'hover:scale-105 focus:scale-105 cursor-pointer text-neutral-600 dark:text-white' : showCheck ? 'bg-green-100 border-green-400 text-green-700' : 'cursor-default text-gray-300 opacity-60'}`}
                style={{ zIndex: 1 }}
                aria-label="Dodaj do koszyka"
                disabled={!isLoggedIn || addLoading || showCheck}
                onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  if (!isLoggedIn || addLoading || showCheck) return;
                  await addToCart(productId, quantity);
                }}
              >
                {showCheck ? (
                  <MdOutlineCheck className="text-green-600" />
                ) : (
                  <MdOutlineAddShoppingCart />
                )}
              </CardItem>
              {addError && <span className="ml-2 text-xs text-red-500">{addError}</span>}
            </div>
          </div>
        </CardBody>
      </CardContainer>
      <Modal open={isModalOpen} onClose={closeModal}>
        <ModalContent
          isLoggedIn={isLoggedIn}
          productname={productname}
          unitprice={unitprice}
          images={images}
          description={description}
          productId={productId}
        />
      </Modal>
    </>
  );
}
