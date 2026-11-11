/**
 * Product Card Component
 * Lancha Jet Quadriciclo - Reusable product display card
 */

import { Link } from 'react-router-dom';
import { Anchor, Waves, Car, Bike } from 'lucide-react';
import { siteConfig } from '../config/site.config';
import './ProductCard.css';

const categoryIcons = {
  lanchas: Anchor,
  'jet-skis': Waves,
  buggys: Car,
  quadriciclos: Bike
};

const categoryLabels = {
  lanchas: 'Lancha',
  'jet-skis': 'Jet Ski',
  buggys: 'Buggy',
  quadriciclos: 'Quadriciclo'
};

export default function ProductCard({ product, variant = 'default', showCompare: _showCompare = false }) {
  const { id: _id, name, category, brand, model, year, price, available, featured, images, thumbnail, shortDescription, badges, specifications } = product;

  const CategoryIcon = categoryIcons[category] || Anchor;
  const categoryLabel = categoryLabels[category] || category;

  // Determine primary image
  const primaryImage = thumbnail || images?.[0] || '/images/products/placeholder-product.jpg';

  // Format price
  const formattedPrice = price ? new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price) : 'Consulte';

  // Get key specs for display
  const keySpecs = [];
  if (specifications?.capacidade) keySpecs.push({ label: 'Capacidade', value: specifications.capacidade, icon: 'users' });
  if (specifications?.motorizacao) keySpecs.push({ label: 'Motor', value: specifications.motorizacao, icon: 'engine' });
  if (specifications?.motor) keySpecs.push({ label: 'Motor', value: specifications.motor, icon: 'engine' });
  if (specifications?.potencia) keySpecs.push({ label: 'Potência', value: `${specifications.potencia} HP`, icon: 'zap' });
  if (specifications?.comprimento) keySpecs.push({ label: 'Comprimento', value: specifications.comprimento, icon: 'ruler' });

  return (
    <article className={`product-card product-card--${variant} ${featured ? 'product-card--featured' : ''} ${!available ? 'product-card--unavailable' : ''}`}>
      {/* Image */}
      <div className="product-card__image-wrapper">
        <Link to={`/produto/${product.slug}`} className="product-card__image-link" aria-label={`Ver detalhes: ${name}`}>
          <img
            src={primaryImage}
            alt={`${name} - ${categoryLabel}`}
            className="product-card__image"
            loading="lazy"
            onError={(e) => { e.target.src = '/images/products/placeholder-product.jpg'; }}
          />
        </Link>

        {/* Badges */}
        {(badges || featured || !available) && (
          <div className="product-card__badges">
            {badges?.map((badge, index) => (
              <span key={index} className="badge badge--gold product-card__badge">{badge}</span>
            ))}
            {featured && <span className="badge badge--gold product-card__badge">Destaque</span>}
            {!available && <span className="badge badge--error product-card__badge">Indisponível</span>}
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="product-card__quick-actions">
          <Link
            to={`/produto/${product.slug}`}
            className="product-card__quick-btn product-card__quick-btn--details"
            aria-label={`Ver detalhes de ${name}`}
          >
            Ver Detalhes
          </Link>
          <a
            href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(`Olá! Tenho interesse no ${name} (${categoryLabel}). Gostaria de consultar disponibilidade e mais informações.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="product-card__quick-btn product-card__quick-btn--whatsapp"
            aria-label={`Consultar ${name} no WhatsApp`}
          >
            Consultar
          </a>
        </div>

        {/* 3D View Indicator - placeholder for phase 2 */}
        {product.model3d && (
          <span className="product-card__3d-badge" title="Visualização 3D disponível">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            3D
          </span>
        )}
      </div>

      {/* Content */}
      <div className="product-card__content">
        <div className="product-card__meta">
          <span className="product-card__category">
            <CategoryIcon size={14} aria-hidden="true" />
            {categoryLabel}
          </span>
          {year && <span className="product-card__year">{year}</span>}
        </div>

        <h3 className="product-card__title">
          <Link to={`/produto/${product.slug}`}>{name}</Link>
        </h3>

        {brand && model && (
          <p className="product-card__model">{brand} {model}</p>
        )}

        {shortDescription && (
          <p className="product-card__description">{shortDescription}</p>
        )}

        {/* Key Specs */}
        {keySpecs.length > 0 && variant !== 'compact' && (
          <ul className="product-card__specs">
            {keySpecs.slice(0, 3).map((spec, index) => (
              <li key={index} className="product-card__spec">
                <span className="product-card__spec-value">{spec.value}</span>
                <span className="product-card__spec-label">{spec.label}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        <div className="product-card__footer">
          <div className="product-card__price-wrapper">
            <span className="product-card__price">{formattedPrice}</span>
            {price === null && <span className="product-card__price-note">Sob consulta</span>}
          </div>

          <div className="product-card__actions">
            <Link
              to={`/produto/${product.slug}`}
              className="btn btn--secondary btn--sm product-card__btn-details"
            >
              Detalhes
            </Link>
            <a
              href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(`Olá! Tenho interesse no ${name} (${categoryLabel}). Gostaria de consultar disponibilidade e mais informações.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--gold btn--sm product-card__btn-whatsapp"
            >
              Consultar
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}