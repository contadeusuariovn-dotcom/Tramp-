/**
 * WhatsApp Floating Button
 * Lancha Jet Quadriciclo
 */

import { useState, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import './WhatsAppButton.css';

// Mensagens personalizadas por categoria
const whatsappMessages = {
  default: 'Olá! Gostaria de saber mais sobre os produtos da Lancha Jet Quadriciclo.',
  lanchas: 'Olá! Conheci o site da Lancha Jet Quadriciclo e gostaria de informações sobre as lanchas disponíveis.',
  'jet-skis': 'Olá! Gostaria de conhecer os jet skis disponíveis.',
  buggys: 'Olá! Tenho interesse nos buggys e quadriciclos.',
  quadriciclos: 'Olá! Tenho interesse nos buggys e quadriciclos.',
  contato: 'Olá! Gostaria de entrar em contato com a Lancha Jet Quadriciclo.',
};

const WHATSAPP_NUMBER = '5516994013303'; // Número confirmado via Instagram oficial

export default function WhatsAppButton({ category = 'default' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const getMessage = () => {
    const msgKey = category === 'default' ? 'default' : category;
    return whatsappMessages[msgKey] || whatsappMessages.default;
  };

  const handleClick = (e) => {
    if (!isExpanded) {
      e.preventDefault();
      setIsExpanded(true);
      // Auto-close after 5 seconds
      setTimeout(() => setIsExpanded(false), 5000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  return (
    <div
      className={`whatsapp-button ${isVisible ? 'whatsapp-button--visible' : 'whatsapp-button--hidden'} ${isExpanded ? 'whatsapp-button--expanded' : ''}`}
      role="region"
      aria-label="Atendimento via WhatsApp"
    >
      {/* Main Button */}
      <button
        className="whatsapp-button__main"
        onClick={handleClick}
        aria-expanded={isExpanded}
        aria-controls="whatsapp-tooltip"
        aria-label={isExpanded ? 'Fechar opções de contato' : 'Abrir WhatsApp'}
      >
        <MessageSquare className="whatsapp-button__icon" aria-hidden="true" />
        <span className="whatsapp-button__pulse" aria-hidden="true" />
      </button>

      {/* Tooltip/Expanded Content */}
      <div id="whatsapp-tooltip" className="whatsapp-button__tooltip" role="tooltip">
        <div className="whatsapp-button__tooltip-content">
          <p className="whatsapp-button__tooltip-text">Fale com um especialista</p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(getMessage())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-button__tooltip-link"
            onClick={() => setIsExpanded(false)}
          >
            <Send size={18} aria-hidden="true" />
            <span>Iniciar conversa no WhatsApp</span>
          </a>
        </div>
        <div className="whatsapp-button__tooltip-arrow" aria-hidden="true" />
      </div>

      {/* Quick Message Options (when expanded) */}
      {isExpanded && (
        <div className="whatsapp-button__expanded" role="menu">
          <div className="whatsapp-button__expanded-header">
            <h4>Como podemos ajudar?</h4>
            <button
              className="whatsapp-button__close"
              onClick={() => setIsExpanded(false)}
              aria-label="Fechar"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <div className="whatsapp-button__expanded-options" role="list">
            {[
              { text: 'Consultar catálogo de lanchas', message: whatsappMessages.lanchas },
              { text: 'Consultar jet skis', message: whatsappMessages['jet-skis'] },
              { text: 'Consultar buggys e quadriciclos', message: whatsappMessages.buggys },
              { text: 'Agendar visita na loja', message: whatsappMessages.contato },
              { text: 'Outro assunto', message: whatsappMessages.default }
            ].map((option, index) => (
              <a
                key={index}
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(option.message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-button__option"
                role="menuitem"
                onClick={() => setIsExpanded(false)}
              >
                <span>{option.text}</span>
                <Send size={16} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}