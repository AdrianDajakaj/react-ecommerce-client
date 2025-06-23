import { CardBody, CardContainer, CardItem } from "./Card";
import { Modal } from "./Modal";
import ModalContent from "./ModalContent";
import img1 from '../../assets/img1.jpg';
import { useState } from "react";

export function ProductComponent() {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleProductClick = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  console.log(isModalOpen)
  return (
    <>
    <CardContainer className="inter-var cursor-pointer">
        <CardBody className="relative group/card
  w-auto sm:w-[30rem] h-auto rounded-2xl p-6
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
        <CardItem translateZ={100} className="w-full mt-4">
            <div className="h-60 w-full rounded-xl overflow-hidden">
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

        <div className="flex justify-between items-center mt-20">
          <CardItem
            translateZ={20}
            as="a"
            href="https://twitter.com/mannupaaji"
            target="__blank"
            className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
          >
            Try now →
          </CardItem>
          <CardItem
            translateZ={20}
            as="button"
            className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
          >
            Sign up
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

