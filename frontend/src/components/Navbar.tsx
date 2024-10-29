
// Navbar component

// Navbar.tsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { MenuIcon, XIcon } from "lucide-react";

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
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

      {/* Mobile Drawer Menu */}
      <Drawer open={isMobileMenuOpen} onClose={toggleMobileMenu}>
        <div className="p-4 flex justify-between items-center border-b">
          <span className="text-xl font-semibold text-primary">Menu</span>
          <Button variant="ghost" onClick={toggleMobileMenu}>
            <XIcon className="h-6 w-6" />
          </Button>
        </div>
        <nav className="flex flex-col p-4 space-y-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-gray-700 hover:text-primary transition-colors"
              onClick={toggleMobileMenu}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </Drawer>
    </header>
  );
};

export default Navbar;