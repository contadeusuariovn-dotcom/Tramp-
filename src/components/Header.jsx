/**
 * Header Component
 * Lancha Jet Quadriciclo - Navigation & Branding
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Anchor,
  ArrowLeft,
  Phone,
  MessageSquare
} from 'lucide-react';
import './Header.css';

const navigation = [
  { name: 'Início', href: '/' },
  { name: 'Catálogo', href: '/catalogo' },
  { name: 'Lanchas', href: '/catalogo?category=lanchas' },
  { name: 'Jet Skis', href: '/catalogo?category=jet-skis' },
  { name: 'Buggys', href: '/catalogo?category=buggys' },
  { name: 'Quadriciclos', href: '/catalogo?category=quadriciclos' },
  { name: 'Rifaina', href: '/#rifaina' },
  { name: 'Sobre', href: '/#sobre' },
  { name: 'Contato', href: '/#contato' }
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Seta "voltar" nas paginas internas: produto -> catalogo, catalogo -> inicio
  const isHome = location.pathname === '/';
  const backTarget = location.pathname.startsWith('/produto/') ? '/catalogo' : '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header
      className={`header ${isScrolled ? 'header--scrolled' : ''}`}
      role="banner"
    >
      <div className="header__container container">
        {/* Seta de voltar (paginas internas) */}
        {!isHome && (
          <Link
            to={backTarget}
            className="header__back"
            aria-label="Voltar para a página anterior"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
        )}

        {/* Logo/Brand */}
        <Link to="/" className="header__logo" aria-label="Lancha Jet Quadriciclo - Início">
          <svg className="header__logo-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path
              d="M24 4L6 16v16l18 12 18-12V16L24 4z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M24 10v14M14 20h20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="24" cy="36" r="3" fill="currentColor" />
          </svg>
          <div className="header__logo-text">
            <span className="header__logo-name">Lancha Jet Quadriciclo</span>
            <span className="header__logo-tagline">Rifaina - SP</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header__nav" role="navigation" aria-label="Navegação principal">
          <ul className="header__nav-list">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`header__nav-link ${location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href)) ? 'header__nav-link--active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Actions */}
        <div className="header__actions">
          <a
            href={`https://wa.me/${'5516994013303'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="header__btn header__btn--whatsapp"
            aria-label="Fale conosco no WhatsApp"
          >
            <MessageSquare size={20} aria-hidden="true" />
            <span>WhatsApp</span>
          </a>
          <a
            href="https://www.instagram.com/lanchajetquadriciclo"
            target="_blank"
            rel="noopener noreferrer"
            className="header__btn header__btn--instagram"
            aria-label="Siga-nos no Instagram"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="header__mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`header__mobile-menu ${isMobileMenuOpen ? 'header__mobile-menu--open' : ''}`}
        role="navigation"
        aria-label="Menu mobile"
      >
        <div className="header__mobile-container">
          <nav className="header__mobile-nav">
            <ul>
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`header__mobile-link ${location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href)) ? 'header__mobile-link--active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header__mobile-actions">
            <a
              href={`https://wa.me/${'5516994013303'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--gold btn--lg btn--full"
              onClick={closeMobileMenu}
            >
              <MessageSquare size={20} aria-hidden="true" />
              Falar no WhatsApp
            </a>
            <a
              href="https://www.instagram.com/lanchajetquadriciclo"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--outline-gold btn--lg btn--full"
              onClick={closeMobileMenu}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              Seguir no Instagram
            </a>
          </div>

          <div className="header__mobile-info">
            <p className="header__mobile-location">
              <Anchor size={16} aria-hidden="true" />
              Rifaina - SP | Represa de Jaguara
            </p>
            <p className="header__mobile-phone">
              <Phone size={16} aria-hidden="true" />
              (16) 99401-3303
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="header__mobile-overlay"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </header>
  );
}