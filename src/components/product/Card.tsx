import { cn } from '@/lib/utils';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { MouseEnterContext } from '@/lib/MouseEnterContext';

/*
 * CardContainer component that wraps children in a 3D card effect with mouse interaction.
 *
 * @param {Object} props - The component props.
 * @param {React.ReactNode} [props.children] - The content to display inside the card.
 * @param {string} [props.className] - Additional CSS classes for the card.
 * @param {string} [props.containerClassName] - Additional CSS classes for the container.
 * @returns {JSX.Element} The rendered CardContainer component.
 */
export const CardContainer = ({
  children,
  className,
  containerClassName,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setIsMouseEntered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
  };

  const handleMouseEnter = () => {
    setIsMouseEntered(true);
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    setIsMouseEntered(false);
    containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  };

  return (
    <div className={cn(containerClassName)} style={{ perspective: '1000px' }}>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(className)}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </div>
    </div>
  );
};

export const CardBody = ({
  children,
  className,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}) => {
  return (
    <div className={cn(className)} {...rest}>
      {children}
    </div>
  );
};

export const CardItem = ({
  as: Tag = 'div',
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}: {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
  [key: string]: unknown;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isMouseEntered] = useContext(MouseEnterContext) || [false, () => {}];

  useEffect(() => {
    if (!ref.current) return;
    const x = isMouseEntered ? `${translateX}px` : '0px';
    const y = isMouseEntered ? `${translateY}px` : '0px';
    const z = isMouseEntered ? `${translateZ}px` : '0px';
    const rotX = isMouseEntered ? `${rotateX}deg` : '0deg';
    const rotY = isMouseEntered ? `${rotateY}deg` : '0deg';
    const rotZ = isMouseEntered ? `${rotateZ}deg` : '0deg';

    ref.current.style.transform =
      `translateX(${x}) translateY(${y}) translateZ(${z}) ` +
      `rotateX(${rotX}) rotateY(${rotY}) rotateZ(${rotZ})`;
  }, [isMouseEntered, translateX, translateY, translateZ, rotateX, rotateY, rotateZ]);

  return (
    <Tag ref={ref} className={cn('w-fit transition duration-200 ease-linear', className)} {...rest}>
      {children}
    </Tag>
  );
};
