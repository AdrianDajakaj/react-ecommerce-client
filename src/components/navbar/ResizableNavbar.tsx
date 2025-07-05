import { cn } from "@/lib/utils";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";

import React, { useRef, useState } from "react";
import { MdArrowBackIosNew, MdMenu, MdOutlineClose } from "react-icons/md";

export interface NavItem {
  id?: number; 
  name: string;
  link?: string;
  subItems?: NavItem[];
  icon?: React.ReactNode;
}

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: NavItem[];
  className?: string;
  onItemClick?: (item: NavItem) => void;
  onBack?: () => void;
  showBack?: boolean;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 10);
  });

  return (
    <motion.div ref={ref} className={cn("fixed inset-x-0 z-40 w-full", className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible }
            )
          : child
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => (
  <motion.div
    animate={{
      width: visible ? "90%" : "100%",
      y: visible ? 20 : 0,
    }}
    transition={{ type: "spring", stiffness: 200, damping: 50 }}
    style={{ minWidth: "800px" }}
    className={cn(
      "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start px-4 py-2 lg:flex",
      visible ? "navbar-glass" : "",
      className
    )}
  >
    {visible && (
      <>
          <div className="effect"/>
          <div className="tint"/>
          <div className="shine"/>
      </>
    )}
    <div className="relative z-10 flex w-full items-center justify-between">
      {children}
    </div>
  </motion.div>
);


export const NavItems = ({ items, className, onItemClick, onBack, showBack }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "relative flex-1 flex flex-row items-center justify-center flex-wrap",
        "gap-x-2 gap-y-0", 
        "text-base font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex",
        className
      )}
    >
      {showBack && (
        <div
          onClick={onBack}
          onMouseEnter={() => setHovered(-1)}
          className="relative px-3 py-2 text-neutral-700 dark:text-neutral-300 cursor-pointer group shrink-0"
        >
          {hovered === -1 && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                boxShadow: `
                  inset 0 2px 4px rgba(0, 0, 0, 0.2),
                  inset 0 4px 8px rgba(0, 0, 0, 0.1)
                `,
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            />
          )}
          <span className="relative z-20 flex items-center gap-1 leading-none">
            <MdArrowBackIosNew  className="text-lg group-hover:text-black dark:group-hover:text-white transition-colors" />
          </span>
        </div>
      )}

      {items.map((item, idx) => (
        <a
          key={idx}
          href={item.link || '#'}
          onMouseEnter={() => setHovered(idx)}
          onClick={(e) => {
            e.preventDefault();
            onItemClick?.(item);
          }}
          className="relative px-3 py-2 text-neutral-700 dark:text-neutral-300 cursor-pointer shrink-0"
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                boxShadow: `
                  inset 0 2px 4px rgba(0, 0, 0, 0.2),
                  inset 0 4px 8px rgba(0, 0, 0, 0.1)
                `,
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            />
          )}
          <span className="relative z-20 flex items-center gap-1 leading-none whitespace-nowrap">
            {item.icon && (
              <span className="inline-flex items-center text-lg leading-none">
                {item.icon}
              </span>
            )}
            <span className="text-xs">{item.name}</span>
          </span>
        </a>
      ))}
    </motion.div>
  );
};


export const MobileNav = ({ children, className, visible }: MobileNavProps) => (
  <motion.div
    animate={{
      backdropFilter: visible ? "none" : "none",
      boxShadow: visible
        ? "none"
        : "none",
      width: visible ? "80%" : "100%",
      paddingRight: visible ? "12px" : "0px",
      paddingLeft: visible ? "12px" : "0px",
      borderRadius: visible ? "2rem" : "2rem",
      y: visible ? 20 : 0,
    }}
    
    transition={{ type: "spring", stiffness: 200, damping: 50 }}
    className={cn(
      "z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between  px-0 py-2 lg:hidden navbar-glass",
      className
    )}
  >
    {visible && (
      <>    
          <div className="effect"/>
          <div className="tint"/>
          <div className="shine"/>
      </>
    )}
    {children}
  </motion.div>
);

export const MobileNavMenu = ({ children, className, isOpen }: MobileNavMenuProps) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
  initial={{ opacity: 1 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className={cn(
    "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-[2rem] px-4 py-8 shadow-lg",
    className
  )}
>
  <div className="effect" />
  <div className="tint" />
  <div className="shine" />
  <div className="relative z-10 w-full">{children}</div>
</motion.div>

    )}
  </AnimatePresence>
);

export const MobileNavHeader = ({ children, className }: MobileNavHeaderProps) => (
  <div className={cn("flex w-full flex-row items-center justify-between px-3", className)}>
    {children}
  </div>
);

export const MobileNavToggle = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void; }) =>
  isOpen ? (
    <button onClick={onClick} className="relative px-3 py-2 text-2xl font-medium cursor-pointer text-black dark:text-white 
     select-none
    transition-colors duration-1000 ease-in-out
    hover:text-red-500 dark:hover:text-red-400 ">
      <MdOutlineClose/>
    </button>
  ) : (
    <button onClick={onClick} className="relative px-3 py-2 text-2xl font-medium cursor-pointer text-black dark:text-white">
      <MdMenu/>
    </button>
  );

export const NavbarLogo = () => (
  <a
    href="#"
    className="relative z-20 flex items-center px-3 py-1 text-sm font-normal text-black dark:text-white"
  >
    <img
      src="/apple_logo.png"
      alt="Apple Logo"
      className="h-6 w-6 object-contain dark:invert"
    />
    <span className="ml-2 translate-y-[1px] text-sm font-medium leading-none">
      Premium Reseller
    </span>
  </a>
);



export const NavbarButton = ({ href, as: Tag = "a", children, className, variant = "primary", ...props }:
  { href?: string; as?: React.ElementType; children: React.ReactNode; className?: string; variant?: "primary" | "secondary" | "dark" | "gradient" } & (
    | React.ComponentPropsWithoutRef<"a">
    | React.ComponentPropsWithoutRef<"button">
  )) => {
  const baseStyles =
    "px-4 py-2 rounded-[2rem] bg-white text-black text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

  const variantStyles = {
    primary: "shadow-lg",
    secondary: "bg-transparent shadow-none dark:text-white",
    dark: "bg-black text-white shadow-lg",
    gradient: "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-inner",
  };

  return (
    <Tag href={href || undefined} className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {children}
    </Tag>
  );
};