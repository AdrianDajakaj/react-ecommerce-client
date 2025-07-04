import { NavbarMenu } from "./components/navbar/NavbarMenu";
import { ProductComponent } from "./components/product/ProductComponent";
import { useCategories } from "./hooks/useCategories"; 
import { useMemo, useState, useEffect } from "react";
import { useLogin } from "@/hooks/useLogin";
import { categoryTreeToNavItems } from "./lib/categoriesToNavItems";
import { SignInForm } from "./components/authentication/SignIn";
import { SignUpForm } from "./components/authentication/SignUp";
import Modal from "./components/product/Modal";
import { AnimatePresence, motion } from 'framer-motion';

type AuthModalView = "signin" | "signup" | null;

export default function App() {
  const [authModalView, setAuthModalView] = useState<AuthModalView>(null);
  const { tree: categories, loading, error } = useCategories();
  const { logout } = useLogin();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!sessionStorage.getItem("jwt_token"));
    const handleStorage = () => setIsLoggedIn(!!sessionStorage.getItem("jwt_token"));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setAuthModalView(null);
  };

  const navItems = useMemo(() => {
    if (loading || error || !categories.length) return [];
    return categoryTreeToNavItems(categories);
  }, [categories, loading, error]);

  // Przykładowa tablica produktów (możesz podmienić na dane z API)

  return (
    <main className="bg-gradient-to-b from-gray-100 to-gray-300 min-h-screen">
      <NavbarMenu
        items={navItems}
        isLoggedIn={isLoggedIn}
        onSignInClick={() => setAuthModalView("signin")}
        onLogout={handleLogout}
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

      {/* Siatka produktów pod navbarem, responsywna */}
      <div className="w-full max-w-7xl mx-auto px-1 sm:px-2 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {[1,2,3,4,5,6].map((_, idx) => (
            <ProductComponent key={idx} isLoggedIn={isLoggedIn} />
          ))}
        </div>
      </div>
    </main>
  );
}
