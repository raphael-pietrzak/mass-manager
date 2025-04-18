
// Navbar component

// Navbar.tsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

interface NavLink {
  label: string;
  href: string;
}

// intention regularity calendar admin

const NAV_LINKS: NavLink[] = [
  { label: "Calendrier", href: "/calendar" },
  { label: "Donateurs", href: "/donors" },
  { label: "Administrateur", href: "/admin" },
];

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="w-full bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <a href="https://www.lagrasse.org/" className="text-xl font-semibold text-primary">
          Lagrasse.org
        </a>

         {/* Desktop Navigation */}
         <nav className="hidden md:flex space-x-6">
          {NAV_LINKS.map((link) => (
            // Ajouter une condition pour "Database"
            (link.label === "Base de données" && isAuthenticated) || link.label !== "Base de données" ? (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ) : null
          ))}

          {/* Bouton "Se déconnecter" si l'utilisateur est authentifié */}
          {isAuthenticated && (
            <Button
              variant="outline"
              className="text-red-500"
              onClick={handleLogout}
            >
              Se déconnecter
            </Button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button variant="ghost" className="md:hidden" onClick={toggleMobileMenu}>
          <MenuIcon className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
};

export default Navbar;