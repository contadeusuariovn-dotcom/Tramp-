/**
 * Product Detail Page
 * Lancha Jet Quadriciclo - Individual Product View
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Anchor,
  Waves,
  Car,
  Bike,
  Truck,
  Users,
  Fuel,
  Settings,
  Ruler,
  Zap,
  Share2,
  Heart,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  MessageSquare,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import Product3DViewer from '../3d/Product3DViewer';
import { getProductBySlug, getProductsByCategory } from '../data/products';
import { siteConfig } from '../config/site.config';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

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

const specIcons = {
  comprimento: Ruler,
  boca: Ruler,
  calado: Ruler,
  peso: Truck,
  capacidade: Users,
  motorizacao: Settings,
  motor: Settings,
  potencia: Zap,
  combustivel: Fuel,
  agua: Fuel,
  velocidadeMaxima: Zap,
  aceleracao: Zap,
  distancia_entre_eixos: Ruler,
  tanque: Fuel,
  capacidade_carga: Truck
};

const specLabels = {
  comprimento: 'Comprimento',
  boca: 'Boca (Largura)',
  calado: 'Calado',
  peso: 'Peso',
  capacidade: 'Capacidade',
  motorizacao: 'Motorização',
  motor: 'Motor',
  potencia: 'Potência',
  combustivel: 'Combustível',
  agua: 'Água',
  velocidadeMaxima: 'Vel. Máxima',
  aceleracao: 'Aceleração',
  distancia_entre_eixos: 'Entre-eixos',
  tanque: 'Tanque',
  capacidade_carga: 'Cap. Carga'
};

export default function ProductDetail() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showFullSpecs, setShowFullSpecs] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset state when slug changes
  const [loadingSlug, setLoadingSlug] = useState(slug);
  if (loadingSlug !== slug) {
    setLoadingSlug(slug);
    setIsLoading(true);
    setCurrentImageIndex(0);
  }

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, [loadingSlug]);

  const images = product?.images?.length ? product.images : [product?.thumbnail || '/images/products/placeholder-product.jpg'];
  const numImages = images.length;

  // Keyboard navigation for image modal
  useEffect(() => {
    if (!isImageModalOpen || numImages <= 1) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => (prev + 1) % numImages);
      } else if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => (prev - 1 + numImages) % numImages);
      } else if (e.key === 'Escape') {
        setIsImageModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isImageModalOpen, numImages]);

  // Navigation functions for image modal
  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % numImages);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + numImages) % numImages);

  const fallbackCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copiado para a área de transferência!');
    } catch {
      prompt('Copie o link:', url);
    }
  };

  // Share functionality
  const handleShare = async () => {
    if (!product) return;
    const url = window.location.href;
    const title = product.name;
    const text = product.shortDescription;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        if (err.name !== 'AbortError') {
          fallbackCopy(url);
        }
      }
    } else {
      fallbackCopy(url);
    }
  };

  if (!product) {
    return (
      <>
        <Header />
        <main id="main-content" className="product-detail-page">
          <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="product-not-found">
              <AlertCircle size={64} aria-hidden="true" />
              <h2>Produto não encontrado</h2>
              <p>O produto que você procura não existe ou foi removido.</p>
              <Link to="/catalogo" className="btn btn--primary btn--lg mt-6">
                <ArrowLeft size={20} aria-hidden="true" />
                Voltar ao Catálogo
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <WhatsAppButton category="contato" />
      </>
    );
  }

  const CategoryIcon = categoryIcons[product.category] || Anchor;
  const categoryLabel = categoryLabels[product.category] || product.category;
  const relatedProducts = getProductsByCategory(product.category).filter(p => p.id !== product.id).slice(0, 4);

  // WhatsApp message
  const whatsappMessage = `Olá! Tenho interesse no ${product.name} (${categoryLabel} ${product.brand ? product.brand + ' ' : ''}${product.model || ''}). Gostaria de consultar disponibilidade, preço e mais informações.`;

  if (isLoading) {
    return (
      <>
        <Header />
        <main id="main-content" className="product-detail-page">
          <div className="product-detail__loading" role="status" aria-label="Carregando produto">
            <Loader2 className="product-detail__spinner" size={48} aria-hidden="true" />
            <span>Carregando detalhes...</span>
          </div>
        </main>
        <Footer />
        <WhatsAppButton category="contato" />
      </>
    );
  }

  return (
    <>
      <Header />

      <main id="main-content" className="product-detail-page">
        {/* Breadcrumb */}
        <nav className="product-detail__breadcrumb" aria-label="Navegação">
          <div className="container">
            <ol className="breadcrumb">
              <li><Link to="/" className="breadcrumb__link">Início</Link></li>
              <li><span className="breadcrumb__separator" aria-hidden="true">/</span></li>
              <li><Link to="/catalogo" className="breadcrumb__link">Catálogo</Link></li>
              <li><span className="breadcrumb__separator" aria-hidden="true">/</span></li>
              <li><Link to={`/catalogo?category=${product.category}`} className="breadcrumb__link">{categoryLabel}s</Link></li>
              <li><span className="breadcrumb__separator" aria-hidden="true">/</span></li>
              <li><span className="breadcrumb__current" aria-current="page">{product.name}</span></li>
            </ol>
          </div>
        </nav>

        {/* Product Gallery & Info */}
        <section className="product-detail__main">
          <div className="container">
            <div className="product-detail__grid">
              {/* Gallery */}
              <div className="product-detail__gallery">
                <div className="product-detail__main-image-wrapper">
                  <button
                    className="product-detail__main-image-btn"
                    onClick={() => setIsImageModalOpen(true)}
                    aria-label="Abrir galeria em tela cheia"
                  >
                    <img
                      src={images[currentImageIndex]}
                      alt={`${product.name} - Imagem ${currentImageIndex + 1} de ${images.length}`}
                      className="product-detail__main-image"
                      loading="eager"
                      onError={(e) => { e.target.src = '/images/products/placeholder-product.jpg'; }}
                    />
                    {images.length > 1 && (
                      <div className="product-detail__zoom-hint">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <span>Clique para ampliar</span>
                      </div>
                    )}
                  </button>

                  {/* 3D Viewer Toggle - Phase 2 */}
                  {product.model3d && (
                    <button className="product-detail__3d-toggle" disabled title="Visualização 3D - Fase 2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                      <span>Ver em 3D</span>
                    </button>
                  )}

                  {/* Image Navigation */}
                  {images.length > 1 && (
                    <>
                      <button
                        className="product-detail__nav product-detail__nav--prev"
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        aria-label="Imagem anterior"
                      >
                        <ChevronLeft size={24} aria-hidden="true" />
                      </button>
                      <button
                        className="product-detail__nav product-detail__nav--next"
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        aria-label="Próxima imagem"
                      >
                        <ChevronRight size={24} aria-hidden="true" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="product-detail__thumbnails" role="group" aria-label="Miniaturas das imagens">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        className={`product-detail__thumb ${index === currentImageIndex ? 'product-detail__thumb--active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`Ver imagem ${index + 1}`}
                        aria-current={index === currentImageIndex ? 'true' : 'false'}
                      >
                        <img
                          src={img}
                          alt={`Miniatura ${index + 1}`}
                          loading="lazy"
                          onError={(e) => { e.target.src = '/images/products/placeholder-product.jpg'; }}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* 3D Viewer Section */}
                <div className="product-detail__3d-section">
                  <Product3DViewer product={product} />
                </div>
              </div>

              {/* Product Info */}
              <div className="product-detail__info">
                {/* Category & Badges */}
                <div className="product-detail__meta">
                  <span className="product-detail__category">
                    <CategoryIcon size={16} aria-hidden="true" />
                    {categoryLabel}
                  </span>
                  {product.year && <span className="product-detail__year">{product.year}</span>}
                  {product.featured && <span className="badge badge--gold">Destaque</span>}
                  {!product.available && <span className="badge badge--error">Indisponível</span>}
                  {product.badges?.map((badge, i) => (
                    <span key={i} className="badge badge--gold">{badge}</span>
                  ))}
                </div>

                <h1 className="product-detail__title">{product.name}</h1>

                {product.brand && product.model && (
                  <p className="product-detail__model">
                    {product.brand} {product.model}
                  </p>
                )}

                {/* Price */}
                <div className="product-detail__price-wrapper">
                  {product.price ? (
                    <span className="product-detail__price">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                    </span>
                  ) : (
                    <>
                      <span className="product-detail__price product-detail__price--consult">Consulte</span>
                      <span className="product-detail__price-note">Preço sob consulta</span>
                    </>
                  )}
                  {product.available ? (
                    <span className="product-detail__availability product-detail__availability--instock">
                      <CheckCircle size={16} aria-hidden="true" />
                      Disponível para consulta
                    </span>
                  ) : (
                    <span className="product-detail__availability product-detail__availability--unavailable">
                      <AlertCircle size={16} aria-hidden="true" />
                      Indisponível no momento
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="product-detail__description">
                  <p>{product.description}</p>
                </div>

                {/* Quick Specs */}
                <div className="product-detail__quick-specs">
                  <h3 className="product-detail__section-title">Principais Especificações</h3>
                  <div className="product-detail__specs-grid">
                    {product.specifications && Object.entries(product.specifications).slice(0, 6).map(([key, value]) => {
                      const IconComponent = specIcons[key] || Settings;
                      return (
                        <div key={key} className="product-detail__spec-item">
                          <span className="product-detail__spec-icon">
                            <IconComponent size={18} aria-hidden="true" />
                          </span>
                          <div className="product-detail__spec-content">
                            <span className="product-detail__spec-label">{specLabels[key] || key}</span>
                            <span className="product-detail__spec-value">{value}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {product.specifications && Object.keys(product.specifications).length > 6 && (
                    <button
                      className="product-detail__show-more"
                      onClick={() => setShowFullSpecs(true)}
                    >
                      Ver todas as especificações ({Object.keys(product.specifications).length})
                    </button>
                  )}
                </div>

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <div className="product-detail__features">
                    <h3 className="product-detail__section-title">Características</h3>
                    <ul className="product-detail__features-list">
                      {product.features.map((feature, index) => (
                        <li key={index} className="product-detail__feature">
                          <CheckCircle size={20} aria-hidden="true" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="product-detail__actions">
                  <a
                    href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--gold btn--lg btn--full product-detail__btn-whatsapp"
                  >
                    <MessageSquare size={20} aria-hidden="true" />
                    Consultar no WhatsApp
                  </a>
                  <Link to="/#contato" className="btn btn--secondary btn--lg btn--full">
                    <MapPin size={20} aria-hidden="true" />
                    Visitar em Rifaina-SP
                  </Link>
                </div>

                {/* Share */}
                <div className="product-detail__share">
                  <button className="product-detail__share-btn" onClick={handleShare} aria-label="Compartilhar produto">
                    <Share2 size={18} aria-hidden="true" />
                    Compartilhar
                  </button>
                  <button className="product-detail__share-btn product-detail__share-btn--wishlist" aria-label="Adicionar aos favoritos">
                    <Heart size={18} aria-hidden="true" />
                    Favoritar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Full Specs Modal */}
        {showFullSpecs && (
          <div className="product-detail__specs-modal" role="dialog" aria-modal="true" aria-labelledby="specs-modal-title">
            <div className="product-detail__specs-modal-content">
              <header className="product-detail__specs-modal-header">
                <h2 id="specs-modal-title">Todas as Especificações Técnicas</h2>
                <button className="product-detail__specs-modal-close" onClick={() => setShowFullSpecs(false)} aria-label="Fechar">
                  <X size={24} aria-hidden="true" />
                </button>
              </header>
              <div className="product-detail__specs-modal-body">
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="product-detail__spec-row">
                    <span className="product-detail__spec-row-label">{specLabels[key] || key}</span>
                    <span className="product-detail__spec-row-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {isImageModalOpen && (
          <div className="product-detail__image-modal" role="dialog" aria-modal="true" aria-label="Galeria de imagens">
            <button className="product-detail__image-modal-close" onClick={() => setIsImageModalOpen(false)} aria-label="Fechar galeria">
              <X size={28} aria-hidden="true" />
            </button>
            {images.length > 1 && (
              <>
                <button className="product-detail__image-modal-nav product-detail__image-modal-nav--prev" onClick={prevImage} aria-label="Imagem anterior">
                  <ChevronLeft size={32} aria-hidden="true" />
                </button>
                <button className="product-detail__image-modal-nav product-detail__image-modal-nav--next" onClick={nextImage} aria-label="Próxima imagem">
                  <ChevronRight size={32} aria-hidden="true" />
                </button>
              </>
            )}
            <div className="product-detail__image-modal-content">
              <img
                src={images[currentImageIndex]}
                alt={`${product.name} - Imagem ${currentImageIndex + 1} de ${images.length}`}
                className="product-detail__image-modal-image"
              />
              <p className="product-detail__image-modal-caption">{currentImageIndex + 1} / {images.length}</p>
            </div>
            {images.length > 1 && (
              <div className="product-detail__image-modal-thumbs">
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`product-detail__image-modal-thumb ${index === currentImageIndex ? 'product-detail__image-modal-thumb--active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                    aria-label={`Ver imagem ${index + 1}`}
                  >
                    <img src={img} alt={`Miniatura ${index + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="product-detail__related" aria-labelledby="related-title">
            <div className="container">
              <header className="section-header">
                <h2 id="related-title" className="section-header__title">Você Também Pode Gostar</h2>
                <p className="section-header__description">Outros {categoryLabel.toLowerCase()}s disponíveis em nosso catálogo</p>
              </header>
              <div className="grid grid--auto">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} variant="default" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="product-detail__cta">
          <div className="container">
            <div className="product-detail__cta-content">
              <h2>Dúvidas sobre este modelo?</h2>
              <p>Nossos especialistas estão prontos para ajudar você a fazer a melhor escolha.</p>
              <div className="product-detail__cta-actions">
                <a
                  href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--gold btn--lg"
                >
                  <MessageSquare size={20} aria-hidden="true" />
                  Falar no WhatsApp
                </a>
                <Link to="/#contato" className="btn btn--secondary btn--lg">
                  Enviar Mensagem
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton category="contato" />
    </>
  );
}