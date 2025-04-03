
// Navbar component

// Navbar.tsx

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";

interface NavLink {
  label: string;
  href: string;
}

// intention regularity calendar admin

const NAV_LINKS: NavLink[] = [
  { label: "Database", href: "/database" },
  { label: "Calendar", href: "/calendar" },
  { label: "Admin", href: "/admin" },

];

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Authentification de l'utilisateur

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = () => {
    // Supprimer le token du localStorage
    localStorage.removeItem("token");
    setIsAuthenticated(false); // Mettre à jour l'état pour cacher le bouton de déconnexion
    window.location.href = "/login"; // Redirection vers la page de connexion
  };

  useEffect(() => {
    // Vérifie l'existence du token dans le localStorage à chaque fois que la page se charge
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true); // Si un token existe, l'utilisateur est authentifié
    } else {
      setIsAuthenticated(false); // Sinon, l'utilisateur n'est pas authentifié
    }
  }, []);

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
            <a
              key={link.href}
              href={link.href}
              className="text-gray-700 hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}

          {/* Afficher le bouton "Se déconnecter" si l'utilisateur est authentifié */}
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