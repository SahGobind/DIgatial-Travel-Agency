import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { 
  Globe, 
  MapPin, 
  Phone, 
  Menu, 
  X, 
  Plane, 
  LogIn, 
  CalendarCheck,
  Languages,
  ChevronRight
} from 'lucide-react';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import { useLanguage } from '../context/LanguageContext';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { language, toggleLanguage, t } = useLanguage();

  const navLinks = [
    { name: t('navHome'), path: '/' },
    { name: t('navServices'), path: '/services' },
    { name: t('navDestinations'), path: '/destinations' },
    { name: t('navInvoices'), path: '/invoices' },
    { name: t('navAbout'), path: '/about' },
    { name: t('navContact'), path: '/contact' },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-sm transition-all duration-200">
      {/* Top utility bar matching agency address and phone numbers */}
      <div className="bg-[#0B2A6F] text-white text-xs py-2 border-b border-[#123D8D]">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Location */}
          <div className="flex items-center gap-1.5 text-blue-100 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#D71920] shrink-0" />
            <span>{language === 'ne' ? 'थापा चोक, जनकपुरधाम, नेपाल' : 'Thapa Chowk, Janakpur Dham, Nepal'}</span>
          </div>

          {/* Contact Numbers & Language Toggle */}
          <div className="flex items-center gap-4 text-blue-100">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <a href="tel:9702022094" className="hover:text-white transition-colors">
                ९७०२०२२०९४
              </a>
              <span className="opacity-40">|</span>
              <a href="tel:9812193621" className="hover:text-white transition-colors">
                ९८१२१९३६२१
              </a>
            </div>
            
            {/* Quick Language Toggle in Header */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] transition-colors border border-white/20"
              title="Switch Language / भाषा बदल्नुहोस्"
            >
              <Languages className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'ne' ? 'English (EN)' : 'नेपाली (NE)'}</span>
            </button>

            <span className="hidden md:inline-block px-2 py-0.5 rounded bg-white/10 text-[11px] font-semibold text-emerald-300">
              {t('open7Days')}
            </span>
          </div>
        </Container>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-white border-b border-slate-100">
        <Container className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 group select-none"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0B2A6F] via-[#123D8D] to-[#D71920] flex items-center justify-center text-white shadow-md shadow-blue-900/10 group-hover:scale-105 transition-transform duration-200">
              <div className="relative">
                <Globe className="w-6 h-6 animate-pulse" />
                <Plane className="w-3.5 h-3.5 absolute -top-1 -right-1 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-[#0B2A6F] leading-tight">
                {language === 'ne' ? 'डिजिटल वर्ल्ड' : 'DIGITAL WORLD'}
              </span>
              <span className="text-xs font-bold tracking-wider text-[#D71920] uppercase">
                {language === 'ne' ? 'टुर एण्ड ट्राभल्स (जनकपुर)' : 'Tour & Travels'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 relative ${
                      isActive
                        ? 'text-[#0B2A6F] bg-blue-50/80 font-bold'
                        : 'text-slate-700 hover:text-[#0B2A6F] hover:bg-slate-50'
                    }`
                  }
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-[#D71920] rounded-full"></span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Language Switch Button */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:text-[#0B2A6F] hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Languages className="w-4 h-4 text-[#0B2A6F]" />
              <span>{language === 'ne' ? 'English' : 'नेपाली'}</span>
            </button>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold text-[#0B2A6F] hover:bg-blue-50 transition-colors border border-blue-100"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('navLogin')}</span>
            </Link>

            <Button
              to="/contact"
              variant="danger"
              size="md"
              icon={CalendarCheck}
              className="shadow-sm hover:shadow-md"
            >
              {t('navBookNow')}
            </Button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2.5 py-1 text-xs font-bold text-[#0B2A6F] bg-blue-50 border border-blue-200 rounded-lg"
            >
              {language === 'ne' ? 'EN' : 'नेपाली'}
            </button>
            <Link
              to="/login"
              className="sm:hidden px-2.5 py-1.5 text-xs font-bold text-[#0B2A6F] border border-blue-200 rounded-lg"
            >
              {t('navLogin')}
            </Link>
            <button
              type="button"
              onClick={toggleMobileMenu}
              aria-label="Toggle Navigation Menu"
              className="p-2.5 rounded-lg text-slate-700 hover:text-[#0B2A6F] hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0B2A6F]"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </Container>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-xl px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1 mb-5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-base font-semibold ${
                    isActive
                      ? 'bg-[#0B2A6F] text-white'
                      : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span>{link.name}</span>
                  <ChevronRight
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                </NavLink>
              );
            })}
          </nav>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <Button
              to="/login"
              variant="outline"
              size="md"
              icon={LogIn}
              className="w-full text-center justify-center"
              onClick={closeMobileMenu}
            >
              Login
            </Button>
            <Button
              to="/contact"
              variant="danger"
              size="md"
              icon={CalendarCheck}
              className="w-full text-center justify-center"
              onClick={closeMobileMenu}
            >
              Book Now
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
