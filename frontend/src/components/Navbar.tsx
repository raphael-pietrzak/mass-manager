
// Navbar component

// Navbar.tsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import logo from '../assets/logo.png';

interface NavLink {
  label: string;
  href: string;
}

// intention regularity calendar admin

const NAV_LINKS: NavLink[] = [
  { label: "Intention", href: "/intention" },
  { label: "Regularity", href: "/regularity" },
  { label: "Calendar", href: "/calendar" },
  { label: "Pending", href: "/pending" },
  { label: "Admin", href: "/admin" },
];

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="w-full bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <a href="/" className="logo">
          <img src={logo} alt="Logo" />
          <h1 className="text-xl font-semibold text-primary">Abbaye</h1>
          <span> Sainte-Marie de Lagrasse </span>
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