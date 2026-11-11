/**
 * Main App Component
 * Lancha Jet Quadriciclo - Routes and Layout
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import './styles/global.css';

const HEADER_HEIGHT = 88; // var(--header-height) em pixels

function ScrollToHash() {
  const location = useLocation();

  const scrollToHash = (hash) => {
    if (!hash) return;
    const id = hash.replace(/^#/, '');
    const element = document.getElementById(id);
    if (element) {
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - HEADER_HEIGHT;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Handle route-based hash changes (e.g., navigating from /catalogo to /#rifaina)
    scrollToHash(location.hash);

    // Handle hash-only changes (e.g., clicking Rifaina while already on /)
    const handleHashChange = () => {
      scrollToHash(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [location.hash]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/produto/:slug" element={<ProductDetail />} />
        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;