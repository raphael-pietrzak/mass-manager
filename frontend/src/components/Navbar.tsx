
// Navbar component

// Navbar.tsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";

interface NavLink {
  label: string;
  href: string;
}

// intention regularity calendar admin

const NAV_LINKS: NavLink[] = [
  { label: "Database", href: "/database" },
  { label: "Intention", href: "/intention" },
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
        <a href="/" className="text-xl font-semibold text-primary">
          MyBrand
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