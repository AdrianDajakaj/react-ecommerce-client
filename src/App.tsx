import { NavbarMenu } from "./components/navbar/NavbarMenu";
import { ProductComponent } from "./components/product/ProductComponent";
import { useCategories } from "./hooks/useCategories"; 
import { useMemo, useState } from "react";
import { categoryTreeToNavItems } from "./lib/categoriesToNavItems";
import { SignInForm } from "./components/authentication/SignIn";
import { SignUpForm } from "./components/authentication/SignUp";
import Modal from "./components/product/Modal";
import { AnimatePresence, motion } from 'framer-motion';

type AuthModalView = "signin" | "signup" | null;

export default function App() {
  const [authModalView, setAuthModalView] = useState<AuthModalView>(null);

  const { tree: categories, loading, error } = useCategories();

  const navItems = useMemo(() => {
    if (loading || error || !categories.length) return [];
    return categoryTreeToNavItems(categories);
  }, [categories, loading, error]);

  return (
    <main className="bg-gradient-to-b from-gray-100 to-gray-300">
      <NavbarMenu
        items={navItems}
        onSignInClick={() => setAuthModalView("signin")}
      />
      <ProductComponent />
      <ProductComponent />
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
      <SignInForm onClose={() => setAuthModalView(null)} onSwitch={() => setAuthModalView("signup")} />
    )}
    {authModalView === "signup" && (
      <SignUpForm onClose={() => setAuthModalView(null)} onSwitch={() => setAuthModalView("signin")} />
    )}
    </motion.div>
  </AnimatePresence>
</Modal>
      
    </main>
  );
}
