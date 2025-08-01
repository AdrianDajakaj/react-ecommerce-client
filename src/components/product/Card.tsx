import { cn } from '@/lib/utils';
import { useContext, useRef, useEffect } from 'react';
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
interface CardContainerProps {
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly containerClassName?: string;
}

export const CardContainer = ({ children, className, containerClassName }: CardContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
  };

  const handleMouseEnter = () => {
    // Mouse enter handled for 3D effect
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
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
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
};

interface CardBodyProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly [key: string]: unknown;
}

export const CardBody = ({ children, className, ...rest }: CardBodyProps) => {
  return (
    <div className={cn(className)} {...rest}>
      {children}
    </div>
  );
};

interface CardItemProps {
  readonly as?: React.ElementType;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly translateX?: number | string;
  readonly translateY?: number | string;
  readonly translateZ?: number | string;
  readonly rotateX?: number | string;
  readonly rotateY?: number | string;
  readonly rotateZ?: number | string;
  readonly [key: string]: unknown;
}

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
}: CardItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isMouseEntered] = useContext(MouseEnterContext) ?? [false, () => {}];

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
