import { NavbarMenu } from "./components/navbar/NavbarMenu";
import { ProductComponent } from "./components/product/ProductComponent";
import { useCategories } from "./hooks/useCategories"; 
import { useMemo, useState, useEffect } from "react";
import { useLogin } from "@/hooks/useLogin";
import { categoryTreeToNavItems } from "./lib/categoriesToNavItems";
import { SignInForm } from "./components/authentication/SignIn";
import { SignUpForm } from "./components/authentication/SignUp";
import Modal from "./components/product/Modal";
import CartRoutes from "./routes/CartRoutes";
import { AnimatePresence, motion } from 'framer-motion';
import { useProducts } from "./hooks/useProducts";
import { useGridColumns } from "./hooks/useGridColumns";
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

type AuthModalView = "signin" | "signup" | null;

export default function App() {
  const [authModalView, setAuthModalView] = useState<AuthModalView>(null);
  const { tree: categories, loading, error } = useCategories();
  const { logout } = useLogin();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  const columns = useGridColumns();
  const rows = 4;
  const pageSize = columns * rows;
  const { products } = useProducts(selectedCategoryId ?? -1);

  // Check if we're in cart routes
  const isCartRoute = location.pathname.startsWith('/cart');
 

  useEffect(() => {
    setIsLoggedIn(!!sessionStorage.getItem("jwt_token"));
    const handleStorage = () => setIsLoggedIn(!!sessionStorage.getItem("jwt_token"));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    // If user is in cart routes, redirect to home page
    if (isCartRoute) {
      navigate('/');
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setAuthModalView(null);
  };

  const navItems = useMemo(() => {
    if (loading || error || !categories.length) return [];
    return categoryTreeToNavItems(categories);
  }, [categories, loading, error]);

  const handleCategorySelect = (categoryId: number) => {
    // Navigate away from cart if we're there
    if (isCartRoute) {
      navigate('/');
    }
    setSelectedCategoryId(categoryId);
    setCurrentPage(1); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedCategoryId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, selectedCategoryId]);

  return (
    <main className="bg-gradient-to-b from-gray-100 to-gray-300 min-h-screen">
      <NavbarMenu
        items={navItems}
        isLoggedIn={isLoggedIn}
        onSignInClick={() => setAuthModalView("signin")}
        onLogout={handleLogout}
        onCategorySelect={handleCategorySelect}
        onLogoClick={() => { 
          if (isCartRoute) {
            navigate('/');
          }
          setSelectedCategoryId(null); 
        }}
        onCartClick={() => navigate('/cart')}
      />


      <Modal
        open={authModalView !== null}
        onClose={() => setAuthModalView(null)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={authModalView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {authModalView === "signin" && (
              <SignInForm
                onClose={handleLoginSuccess}
                onSwitch={() => setAuthModalView("signup")}
              />
            )}
            {authModalView === "signup" && (
              <SignUpForm
                onClose={() => setAuthModalView(null)}
                onSwitch={() => setAuthModalView("signin")}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </Modal>

      <Routes>
        <Route path="/cart/*" element={
          <div className="w-full max-w-7xl mx-auto px-1 sm:px-2 pt-16 pb-8">
            <CartRoutes />
          </div>
        } />
        <Route path="/*" element={
          <div className="w-full max-w-7xl mx-auto px-1 sm:px-2 pt-16 pb-8">
            {selectedCategoryId ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {products
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((product, idx) => (
                      <ProductComponent
                        key={product.id ?? idx}
                        isLoggedIn={isLoggedIn}
                        category={product.category_name}
                        productname={product.name}
                        images={product.images.map(img => img.url)}
                        unitprice={product.price}
                        maxQty={product.stock}
                        description={product.description}
                        productId={product.id}
                      />
                    ))}
                </div>
                {products.length > pageSize && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      className={`flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-white/60 shadow-inner text-xl transition-transform
                        ${currentPage !== 1 ? 'hover:scale-105 focus:scale-105 cursor-pointer text-neutral-600 dark:text-white' : 'cursor-default text-gray-300 opacity-60'}`}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      aria-label="Poprzednia strona"
                      style={{ zIndex: 1 }}
                    >
                      <MdArrowBackIosNew />
                    </button>
                    <span className="text-gray-700">
                      Page {currentPage} of {Math.ceil(products.length / pageSize)}
                    </span>
                    <button
                      className={`flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-white/60 shadow-inner text-xl transition-transform
                        ${currentPage !== Math.ceil(products.length / pageSize) ? 'hover:scale-105 focus:scale-105 cursor-pointer text-neutral-600 dark:text-white' : 'cursor-default text-gray-300 opacity-60'}`}
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(products.length / pageSize), p + 1))}
                      disabled={currentPage === Math.ceil(products.length / pageSize)}
                      aria-label="Następna strona"
                      style={{ zIndex: 1 }}
                    >
                      <MdArrowForwardIos />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 text-lg py-16">Select a category to see the products you are interested in. </div>
            )}
          </div>
        } />
      </Routes>
    </main>
  );
}
