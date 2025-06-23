import React, { useState, useRef } from "react";
import img1 from "../../assets/img1.jpg";
import img2 from "../../assets/img2.jpg";
import img3 from "../../assets/img3.jpg";

const images = [img1, img2, img3];

export const ModalContent: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const SWIPE_THRESHOLD = 50; // px

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
  };

  const onTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    if (distance > SWIPE_THRESHOLD && current < images.length - 1) {
      setCurrent((c) => c + 1);
    } else if (distance < -SWIPE_THRESHOLD && current > 0) {
      setCurrent((c) => c - 1);
    }
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
              onClick={() => setCurrent((c) => c - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out cursor-pointer z-10"
            >
              <span className="text-2xl text-gray-700 dark:text-gray-200 select-none">‹</span>
            </button>
          )}
          {current < images.length - 1 && (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out cursor-pointer z-10"
            >
              <span className="text-2xl text-gray-700 dark:text-gray-200 select-none">›</span>
            </button>
          )}
        </div>
        <div className="flex space-x-2 mt-3">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full transition cursor-pointer ${
                idx === current ? "bg-gray-800 dark:bg-gray-200" : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
        <div className="mt-4 w-full flex justify-start px-4">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
            Buy
          </button>
        </div>
      </div>

      <div className="w-full sm:w-1/2 p-4 flex flex-col h-full relative">
        <div className="relative flex-1 overflow-hidden rounded-md">
          <div
            ref={scrollContainerRef}
            className="overflow-y-auto h-full pr-2 custom-scrollbar"
          >
            <div className="space-y-6 divide-y divide-gray-200 dark:divide-gray-700 p-2 pb-24">
              <div className="pb-4">
                <h2 className="text-2xl font-semibold">iPad Pro 11-inch</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  From $999 or $83.25/mo. for 12 mo.⁺
                </p>
              </div>
              <div className="pt-4 pb-4">
                <p>
                  Ultra Retina XDR display⁽²⁾ with ProMotion, P3 wide color, and True Tone.
                </p>
              </div>
              <div className="pt-4 pb-4">
                <p>
                  Apple M4 chip delivers outrageous performance for pro workflows and
                  all-day battery life⁽³⁾.
                </p>
              </div>
              <div className="pt-4 pb-4">
                <p>
                  Pro camera with LiDAR Scanner, and Landscape 12MP Center Stage camera.
                </p>
              </div>
              <div className="pt-4 pb-4">
                <p>
                  Compatible with Apple Pencil Pro, Apple Pencil (USB-C), Magic Keyboard
                  for iPad Pro, and more accessories.
                </p>
              </div>
              <div className="pt-4 pb-4">
                <p>
                  More detailed descriptions or lorem ipsum to test scrolling behavior.
                </p>
              </div>
              <div className="pt-4 pb-4">
                <p>
                  Even more content for testing scroll and sticky button.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ModalContent;
