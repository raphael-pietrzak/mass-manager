// Navbar component

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { NavLink } from "react-router-dom";

interface NavLinkItem {
  label: string;
  href: string;
}

const NAV_LINKS: NavLinkItem[] = [
  { label: "Calendrier", href: "/calendar" },
  { label: "Intentions ponctuelles", href: "/intentions" },
  { label: "Intentions récurrentes", href: "/recurrences" },
  { label: "Administrateur", href: "/admin" },
];

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, userRole } = useAuth();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="w-full bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <a href="https://www.lagrasse.org/" className="text-xl font-semibold text-primary flex items-center">
          Lagrasse.org
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 items-center">
          {NAV_LINKS.map((link) => (
            // Ajouter une condition pour "Administrateur"
            (link.label === "Administrateur" && isAuthenticated && userRole === "admin") || link.label !== "Administrateur" ? (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `text-gray-700 hover:text-primary transition-colors py-2 ${isActive ? "text-primary font-medium border-b-2 border-primary" : ""
                  }`
                }
              >
                {link.label}
              </NavLink>
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

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-lg">
          <nav className="flex flex-col p-4 space-y-3">
            {NAV_LINKS.map((link) => (
              (link.label === "Administrateur" && isAuthenticated) || link.label !== "Administrateur" ? (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    `text-gray-700 hover:text-primary py-2 ${isActive ? "text-primary font-medium" : ""
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ) : null
            ))}

            {isAuthenticated && (
              <Button
                variant="outline"
                className="text-red-500 w-full"
                onClick={handleLogout}
              >
                Se déconnecter
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;