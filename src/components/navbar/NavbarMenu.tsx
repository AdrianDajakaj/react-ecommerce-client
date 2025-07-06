import { useEffect, useState } from 'react';
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from '@/components/navbar/ResizableNavbar';
import type { NavItem } from '@/components/navbar/ResizableNavbar';
import {
  MdArrowBackIosNew,
  MdOutlineLogin,
  MdOutlineLogout,
  MdOutlineShoppingCart,
} from 'react-icons/md';

import { motion } from 'framer-motion';

/*
 * NavbarMenu component that renders a responsive navigation menu with support for nested items,
 * mobile view, and user authentication actions.
 *
 * @param {Object} props - The component props.
 * @param {NavItem[]} props.items - The navigation items to display.
 * @param {Function} props.onSignInClick - Callback for sign-in button click.
 * @param {boolean} [props.isLoggedIn=false] - Indicates if the user is logged in.
 * @param {Function} [props.onLogout] - Callback for logout action.
 * @param {Function} [props.onCategorySelect] - Callback for category selection.
 * @param {Function} [props.onLogoClick] - Callback for logo click.
 * @param {Function} [props.onCartClick] - Callback for cart button click.
 * @returns {JSX.Element} The rendered NavbarMenu component.
 */
interface NavbarMenuProps {
  readonly items: NavItem[];
  readonly onSignInClick: () => void;
  readonly isLoggedIn?: boolean;
  readonly onLogout?: () => void;
  readonly onCategorySelect?: (categoryId: number) => void;
  readonly onLogoClick?: () => void;
  readonly onCartClick?: () => void;
}

export function NavbarMenu({
  items,
  onSignInClick,
  isLoggedIn = false,
  onLogout,
  onCategorySelect,
  onLogoClick,
  onCartClick,
}: NavbarMenuProps) {
  const [menuStack, setMenuStack] = useState<NavItem[][]>([]);
  const currentMenu = menuStack[menuStack.length - 1] ?? [];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    if (items && items.length > 0) {
      setMenuStack([items]);
    }
  }, [items]);

  const handleItemClick = (item: NavItem) => {
    if (item.subItems) {
      setMenuStack(prev => [...prev, item.subItems!]);
    } else if (onCategorySelect && item.id !== undefined) {
      onCategorySelect(item.id);
      closeMenu();
    } else if (item.link) {
      window.location.href = item.link;
      closeMenu();
    }
  };

  const handleBack = () => {
    setMenuStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
    setHoveredIdx(null);
  };

  const toggleMenu = () => {
    const willOpen = !isMobileMenuOpen;
    setIsMobileMenuOpen(willOpen);
    if (!willOpen) {
      setMenuStack([items]);
      setHoveredIdx(null);
    }
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    setMenuStack([items]);
    setHoveredIdx(null);
  };

  return (
    <div className="relative w-full">
      <Navbar>
        <NavBody>
          <button
            onClick={onLogoClick}
            className="bg-transparent border-0 cursor-pointer p-0"
            type="button"
            aria-label="Go to home page"
          >
            <NavbarLogo />
          </button>
          <NavItems
            items={currentMenu}
            showBack={menuStack.length > 1}
            onBack={handleBack}
            onItemClick={handleItemClick}
          />
          <div className="flex items-center gap-4">
            {isLoggedIn && (
              <NavbarButton onClick={onCartClick} variant="primary">
                <span className="flex items-center justify-center gap-2">
                  <MdOutlineShoppingCart className="text-base" />
                  <span className="font-light text-xs">Cart</span>
                </span>
              </NavbarButton>
            )}
            {isLoggedIn ? (
              <NavbarButton onClick={onLogout} variant="primary">
                <span className="flex items-center justify-center gap-2">
                  <MdOutlineLogout className="text-base" />
                  <span className="font-light text-xs">Sign out</span>
                </span>
              </NavbarButton>
            ) : (
              <NavbarButton onClick={onSignInClick} variant="primary">
                <span className="flex items-center justify-center gap-2">
                  <MdOutlineLogin className="text-base" />
                  <span className="font-light text-xs">Sign in</span>
                </span>
              </NavbarButton>
            )}
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            {menuStack.length > 1 ? (
              <button onClick={handleBack} className="cursor-pointer relative px-3 py-2 text-lg">
                <MdArrowBackIosNew />
              </button>
            ) : (
              <NavbarLogo />
            )}
            <MobileNavToggle isOpen={isMobileMenuOpen} onClick={toggleMenu} />
          </MobileNavHeader>

          <MobileNavMenu isOpen={isMobileMenuOpen}>
            {currentMenu.length === 0 ? (
              <p className="px-4 py-2 text-sm text-gray-400">Brak kategorii</p>
            ) : (
              currentMenu.map((item, idx) => (
                <motion.a
                  key={item.id ? `mobile-nav-${item.id}` : `mobile-nav-${item.name}-${idx}`}
                  href={item.link ?? '#'}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={e => {
                    e.preventDefault();
                    handleItemClick(item);
                  }}
                  className="relative flex items-center gap-2 w-full px-4 py-2 text-neutral-600 dark:text-neutral-300 cursor-pointer"
                >
                  {hoveredIdx === idx && (
                    <motion.div
                      layoutId="mobile-hover"
                      className="absolute inset-0 rounded-[2rem]"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        boxShadow:
                          'inset 0 2px 4px rgba(0,0,0,0.2), inset 0 4px 8px rgba(0,0,0,0.1)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                  {item.icon && <span className="relative text-xl">{item.icon}</span>}
                  <span className="relative z-5 text-xs">{item.name}</span>
                </motion.a>
              ))
            )}

            <div className="flex w-full flex-col gap-4 pt-4 border-t">
              {isLoggedIn && (
                <NavbarButton onClick={onCartClick} variant="primary" className="w-full">
                  <span className="flex items-center justify-center gap-2">
                    <MdOutlineShoppingCart className="text-base" />
                    <span className="font-light text-xs">Cart</span>
                  </span>
                </NavbarButton>
              )}
              {isLoggedIn ? (
                <NavbarButton onClick={onLogout} variant="primary" className="w-full">
                  <span className="flex items-center justify-center gap-2">
                    <MdOutlineLogout className="text-base" />
                    <span className="font-light text-xs">Sign out</span>
                  </span>
                </NavbarButton>
              ) : (
                <NavbarButton onClick={onSignInClick} variant="primary" className="w-full">
                  <span className="flex items-center justify-center gap-2">
                    <MdOutlineLogin className="text-base" />
                    <span className="font-light text-xs">Sign in</span>
                  </span>
                </NavbarButton>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
