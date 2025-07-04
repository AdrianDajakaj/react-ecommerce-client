import { CardBody, CardContainer, CardItem } from "./Card";
import { Modal } from "./Modal";
import ModalContent from "./ModalContent";
import img1 from '../../assets/img1.jpg';
import { useState } from "react";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight, MdOutlineAddShoppingCart } from "react-icons/md";

export function ProductComponent({ isLoggedIn = true }: { isLoggedIn?: boolean }) {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleProductClick = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  console.log(isModalOpen)
  const [quantity, setQuantity] = useState(1);
  const minQty = 1;
  const maxQty = 10;
  return (
    <>
    <CardContainer className="inter-var cursor-pointer">
        <CardBody className="relative group/card flex flex-col
  w-full h-full rounded-2xl p-6
  bg-white/20 dark:bg-gray-50/10
  border border-white/30 dark:border-gray-300/20
  backdrop-filter backdrop-blur-lg
  shadow-md
  transition"
  onClick={handleProductClick}
  >

        <CardItem
          translateZ="50"
          className="text-xl font-bold text-neutral-600 dark:text-white"
        >
          iPad
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
        >
          Pro 11 128GB
        </CardItem>
        <CardItem translateZ={100} className="w-full mt-4 flex-1">
            <div className="h-full w-full rounded-xl overflow-hidden">
                <img
                src={img1}
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
                onClick={e => { e.stopPropagation(); setQuantity(q => Math.max(minQty, q - 1)); }}
                disabled={quantity === minQty}
                aria-label="Zmniejsz ilość"
              >
                <MdOutlineKeyboardArrowLeft />
              </button>
              <span className="mx-2 text-base font-medium text-neutral-600 dark:text-white w-5 text-center" style={{ fontVariantNumeric: 'tabular-nums' }}>{quantity}</span>
              <button
                type="button"
                className={`text-xl text-neutral-600 dark:text-white px-0.5 focus:outline-none disabled:text-gray-300 ${quantity < maxQty ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={e => { e.stopPropagation(); setQuantity(q => Math.min(maxQty, q + 1)); }}
                disabled={quantity === maxQty}
                aria-label="Zwiększ ilość"
              >
                <MdOutlineKeyboardArrowRight />
              </button>
            </div>
          </div>
        <CardItem
          translateZ={20}
          as="button"
          className={`flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-white/60 shadow-inner mr-2 text-xl transition-transform ${isLoggedIn ? 'hover:scale-105 focus:scale-105 cursor-pointer text-neutral-600 dark:text-white' : 'cursor-default text-gray-300 opacity-60'}`}
          style={{ zIndex: 1 }}
          aria-label="Dodaj do koszyka"
          disabled={!isLoggedIn}
        >
          <MdOutlineAddShoppingCart />
        </CardItem>
        </div>
      </CardBody>
    </CardContainer>
    <Modal open={isModalOpen} onClose={closeModal}>
        <ModalContent />
      </Modal>    
    </>
  );
}

