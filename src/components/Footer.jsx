/**
 * Footer Component
 * Lancha Jet Quadriciclo
 */

import { Link } from 'react-router-dom';
import {
  Anchor,
  Waves,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Sun
} from 'lucide-react';
import { siteConfig } from '../config/site.config';
import './Footer.css';

const footerLinks = {
  empresa: [
    { name: 'Sobre Nós', href: '/#sobre' },
    { name: 'Catálogo', href: '/catalogo' },
    { name: 'Lanchas', href: '/catalogo?category=lanchas' },
    { name: 'Jet Skis', href: '/catalogo?category=jet-skis' },
    { name: 'Buggys', href: '/catalogo?category=buggys' },
    { name: 'Quadriciclos', href: '/catalogo?category=quadriciclos' }
  ],
  suporte: [
    { name: 'Fale Conosco', href: '/#contato' },
    { name: 'WhatsApp', href: `https://wa.me/${siteConfig.contact.whatsapp}`, external: true },
    { name: 'Instagram', href: siteConfig.contact.instagram, external: true },
    { name: 'Localização', href: siteConfig.contact.mapsUrl, external: true }
  ],
  rifaina: [
    { name: 'Represa de Jaguara', href: '/#rifaina' },
    { name: 'Passeios Náuticos', href: '/#rifaina' },
    { name: 'Praias de Água Doce', href: '/#rifaina' },
    { name: 'Turismo em Rifaina', href: '/#rifaina' }
  ]
};

// Custom Instagram SVG component
const InstagramIcon = ({ size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props} aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const socialLinks = [
  {
    name: 'WhatsApp',
    href: `https://wa.me/${siteConfig.contact.whatsapp}`,
    icon: MessageSquare,
    color: '#25D366',
    external: true
  },
  {
    name: 'Instagram',
    href: siteConfig.contact.instagram,
    icon: InstagramIcon,
    color: '#E4405F',
    external: true
  }
];

const currentYear = new Date().getFullYear();

export default function Footer() {

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__main">
        <div className="container">
          <div className="footer__grid">
            {/* Brand Column */}
            <div className="footer__brand">
              <Link to="/" className="footer__logo" aria-label="Lancha Jet Quadriciclo - Início">
                <svg className="footer__logo-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
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
                <div className="footer__logo-text">
                  <span className="footer__logo-name">Lancha Jet Quadriciclo</span>
                  <span className="footer__logo-tagline">Rifaina - SP</span>
                </div>
              </Link>

              <p className="footer__description">
                Sua próxima aventura na Represa de Jaguara começa aqui.
                Lanchas, jet skis e veículos recreativos para momentos inesquecíveis.
              </p>

              <div className="footer__social">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer__social-link"
                    style={{ '--social-color': social.color }}
                    aria-label={social.name}
                  >
                    <social.icon size={20} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation Columns */}
            <nav className="footer__nav" aria-label="Links da empresa">
              <h3 className="footer__heading">Empresa</h3>
              <ul className="footer__list">
                {footerLinks.empresa.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="footer__link">{link.name}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="footer__nav" aria-label="Links de suporte">
              <h3 className="footer__heading">Suporte</h3>
              <ul className="footer__list">
                {footerLinks.suporte.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="footer__link"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="footer__nav" aria-label="Links sobre Rifaina">
              <h3 className="footer__heading">Rifaina & Região</h3>
              <ul className="footer__list">
                {footerLinks.rifaina.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="footer__link">{link.name}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Contact Column */}
            <div className="footer__contact">
              <h3 className="footer__heading">Contato</h3>
              <address className="footer__address">
                <div className="footer__contact-item">
                  <MapPin size={18} aria-hidden="true" />
                  <div>
                    <p className="footer__contact-label">Endereço</p>
                    <p>{siteConfig.contact.address.street}, {siteConfig.contact.address.neighborhood} - {siteConfig.contact.address.city}/{siteConfig.contact.address.state}<br />CEP {siteConfig.contact.address.cep}</p>
                  </div>
                </div>

                <div className="footer__contact-item">
                  <Phone size={18} aria-hidden="true" />
                  <div>
                    <p className="footer__contact-label">Telefone</p>
                    <a href={`tel:+${siteConfig.contact.whatsapp}`} className="footer__contact-value">{siteConfig.contact.phone}</a>
                  </div>
                </div>

                <div className="footer__contact-item">
                  <Mail size={18} aria-hidden="true" />
                  <div>
                    <p className="footer__contact-label">E-mail</p>
                    <a href={`mailto:${siteConfig.contact.email}`} className="footer__contact-value">{siteConfig.contact.email}</a>
                  </div>
                </div>

                <div className="footer__contact-item">
                  <MessageSquare size={18} aria-hidden="true" />
                  <div>
                    <p className="footer__contact-label">WhatsApp</p>
                    <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="footer__contact-value">Fale conosco</a>
                  </div>
                </div>
              </address>

              <div className="footer__hours">
                <h4 className="footer__hours-title">Horário de Funcionamento</h4>
                <ul className="footer__hours-list">
                  <li><span>Segunda a Sexta</span><span>08:00 - 18:00</span></li>
                  <li><span>Sábado</span><span>08:00 - 14:00</span></li>
                  <li><span>Domingo</span><span>Fechado</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="container">
          <div className="footer__bottom-content">
            <p className="footer__copyright">
              &copy; {currentYear} Lancha Jet Quadriciclo. Todos os direitos reservados.
            </p>

            <div className="footer__badges">
              <span className="footer__badge">
                <Anchor size={14} aria-hidden="true" /> Náutica Premium
              </span>
              <span className="footer__badge">
                <Waves size={14} aria-hidden="true" /> Represa de Jaguara
              </span>
              <span className="footer__badge">
                <Sun size={14} aria-hidden="true" /> Lazer & Aventura
              </span>
            </div>
          </div>

          <p className="footer__disclaimer">
            <strong>Nota:</strong> Preços, especificações e disponibilidade devem ser confirmados
            diretamente com a empresa.
          </p>
        </div>
      </div>
    </footer>
  );
}