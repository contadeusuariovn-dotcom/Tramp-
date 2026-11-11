/**
 * Home Page
 * Lancha Jet Quadriciclo - Landing Page
 */

import { Link } from 'react-router-dom';
import { ArrowRight, Anchor, Waves, Car, Bike, MapPin, Sun, ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ProductCard from '../components/ProductCard';
import { getFeaturedProducts, getCategoriesWithCounts } from '../data/products';
import { siteConfig } from '../config/site.config';
import './Home.css';

export default function Home() {
  const featuredProducts = getFeaturedProducts();
  const categoriesWithCounts = getCategoriesWithCounts();

  const categories = [
    {
      id: 'lanchas',
      label: 'Lanchas',
      description: 'Embarcações para lazer e passeios na Represa de Jaguara',
      icon: Anchor,
      image: '/images/categories/lanchas.jpg',
      href: '/catalogo?category=lanchas',
      count: categoriesWithCounts.find(c => c.id === 'lanchas')?.count || 0
    },
    {
      id: 'jet-skis',
      label: 'Jet Skis',
      description: 'Motos aquáticas para adrenalina e diversão na água',
      icon: Waves,
      image: '/images/categories/jet-skis.jpg',
      href: '/catalogo?category=jet-skis',
      count: categoriesWithCounts.find(c => c.id === 'jet-skis')?.count || 0
    },
    {
      id: 'buggys',
      label: 'Buggys',
      description: 'Veículos off-road para trilhas e aventuras terrestres',
      icon: Car,
      image: '/images/categories/buggys.jpg',
      href: '/catalogo?category=buggys',
      count: categoriesWithCounts.find(c => c.id === 'buggys')?.count || 0
    },
    {
      id: 'quadriciclos',
      label: 'Quadriciclos',
      description: 'ATVs para trabalho e lazer em qualquer terreno',
      icon: Bike,
      image: '/images/categories/quadriciclos.jpg',
      href: '/catalogo?category=quadriciclos',
      count: categoriesWithCounts.find(c => c.id === 'quadriciclos')?.count || 0
    }
  ];

  const rifainaHighlights = [
    { icon: Sun, title: 'Represa de Jaguara', desc: 'Águas calmas e cristalinas perfeitas para navegação' },
    { icon: MapPin, title: 'Praias de Água Doce', desc: 'Faixas de areia natural ideais para ancorar e relaxar' },
    { icon: Anchor, title: 'Passeios Náuticos', desc: 'Roteiros guiados pelas mais belas paisagens da região' },
    { icon: Waves, title: 'Pôr do Sol Espetacular', desc: 'Final de tarde inesquecível sobre as águas da represa' }
  ];

  return (
    <>
      <Header />

      <main id="main-content">
        {/* ===== HERO SECTION ===== */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__background">
            <img
              src="/images/hero/hero-represa-jaguara.jpg"
              alt="Lancha navegando na Represa de Jaguara em Rifaina-SP ao pôr do sol"
              className="hero__image"
              loading="eager"
              onError={(e) => { e.target.src = '/images/hero/hero-fallback.jpg'; }}
            />
            <div className="hero__overlay" />
          </div>

          <div className="hero__content container">
            <div className="hero__text">
              <span className="hero__eyebrow">Lancha Jet Quadriciclo • Rifaina - SP</span>
              <h1 id="hero-title" className="hero__title">
                SEU PRÓXIMO DESTINO<br />
                <span className="hero__title-highlight">COMEÇA NA ÁGUA</span>
              </h1>
              <p className="hero__subtitle">
                Lanchas, jet skis e veículos recreativos para transformar seus momentos
                de lazer em experiências inesquecíveis na Represa de Jaguara.
              </p>

              <div className="hero__actions">
                <Link to="/catalogo" className="btn btn--gold btn--lg hero__btn-primary">
                  CONHEÇA NOSSO CATÁLOGO
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
                <a
                  href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Ol%C3%A1!%20Gostaria%20de%20falar%20com%20um%20especialista%20da%20Lancha%20Jet%20Quadriciclo.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--secondary btn--lg hero__btn-secondary"
                >
                  FALE COM UM ESPECIALISTA
                </a>
              </div>

              <div className="hero__trust">
                <div className="hero__trust-item">
                  <span className="hero__trust-number">15+</span>
                  <span className="hero__trust-label">Anos de Experiência</span>
                </div>
                <div className="hero__trust-item">
                  <span className="hero__trust-number">500+</span>
                  <span className="hero__trust-label">Clientes Satisfeitos</span>
                </div>
                <div className="hero__trust-item">
                  <span className="hero__trust-number">Represa<br />de Jaguara</span>
                  <span className="hero__trust-label">Localização Privilegiada</span>
                </div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="hero__scroll">
              <ChevronDown size={24} aria-hidden="true" />
              <span>Descubra mais</span>
            </div>
          </div>
        </section>

        {/* ===== CATEGORIES SECTION ===== */}
        <section id="categorias" className="categories" aria-labelledby="categories-title">
          <div className="container">
            <header className="section-header">
              <span className="section-header__eyebrow">Nossas Categorias</span>
              <h2 id="categories-title" className="section-header__title">Encontre o Veículo Ideal</h2>
              <p className="section-header__description">
                Três categorias premium para sua aventura na água e na terra.
                Qualidade, performance e segurança em cada detalhe.
              </p>
            </header>

            <div className="categories__grid">
              {categories.map((category, index) => (
                <article
                  key={category.id}
                  className="category-card"
                  style={{ '--stagger-delay': `${(index + 1) * 100}ms` }}
                >
                  <Link to={category.href} className="category-card__link" aria-label={`Ver ${category.label}`}>
                    <div className="category-card__image-wrapper">
                      <img
                        src={category.image}
                        alt={category.label}
                        className="category-card__image"
                        loading="lazy"
                        onError={(e) => { e.target.src = '/images/categories/category-fallback.jpg'; }}
                      />
                      <div className="category-card__overlay" />
                    </div>

                    <div className="category-card__content">
                      <div className="category-card__icon">
                        <category.icon size={28} aria-hidden="true" />
                      </div>
                      <h3 className="category-card__title">{category.label}</h3>
                      <p className="category-card__description">{category.description}</p>
                      <div className="category-card__meta">
                        <span className="category-card__count">
                          {category.count > 0
                            ? `${category.count} ${category.count === 1 ? 'modelo' : 'modelos'} disponíveis`
                            : 'Em breve — sob consulta'}
                        </span>
                        <span className="category-card__arrow">
                          <ArrowRight size={16} aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            <div className="categories__cta">
              <Link to="/catalogo" className="btn btn--primary btn--lg">
                Ver Catálogo Completo
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* ===== FEATURED PRODUCTS ===== */}
        <section id="destaques" className="featured" aria-labelledby="featured-title">
          <div className="container">
            <header className="section-header section-header--light">
              <span className="section-header__eyebrow">Em Destaque</span>
              <h2 id="featured-title" className="section-header__title">Produtos Selecionados</h2>
              <p className="section-header__description">
                Nossa curadoria dos melhores modelos disponíveis.
                Cada embarcação e veículo passa por rigorosa inspeção.
              </p>
            </header>

            <div className="featured__grid grid grid--auto">
              {featuredProducts.slice(0, 6).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="default"
                />
              ))}
            </div>

            <div className="featured__cta">
              <Link to="/catalogo" className="btn btn--gold btn--lg">
                Ver Todos os Produtos
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* ===== ABOUT SECTION ===== */}
        <section id="sobre" className="about" aria-labelledby="about-title">
          <div className="container">
            <div className="about__grid">
              <div className="about__content">
                <header className="section-header section-header--left">
                  <span className="section-header__eyebrow">Sobre Nós</span>
                  <h2 id="about-title" className="section-header__title">Mais do que Produtos, Experiências</h2>
                </header>

                <div className="about__text">
                  <p>
                    A <strong>Lancha Jet Quadriciclo</strong> nasceu da paixão pelo universo náutico
                    e pelo lazer ao ar livre. Localizada em <strong>Rifaina-SP</strong>, às margens
                    da Represa de Jaguara, somos referência em embarcações e veículos recreativos
                    na região.
                  </p>
                  <p>
                    Mais do que vender lanchas, jet skis, buggys e quadriciclos, nossa missão é
                    proporcionar <strong>momentos inesquecíveis</strong> para famílias e amigos.
                    Seja navegando pelas águas calmas da represa, explorando trilhas off-road
                    ou simplesmente contemplando o pôr do sol, estamos aqui para tornar tudo possível.
                  </p>
                  <p>
                    Trabalhamos com as melhores marcas do mercado, oferecendo suporte completo:
                    da escolha do modelo ideal até a manutenção e documentação. Sua confiança
                    é nosso maior patrimônio.
                  </p>
                </div>

                <div className="about__features">
                  <div className="about__feature">
                    <span className="about__feature-icon">
                      <Anchor size={24} aria-hidden="true" />
                    </span>
                    <div>
                      <h4>Especialistas Náuticos</h4>
                      <p>Conhecimento técnico para orientar a melhor escolha</p>
                    </div>
                  </div>
                  <div className="about__feature">
                    <span className="about__feature-icon">
                      <Waves size={24} aria-hidden="true" />
                    </span>
                    <div>
                      <h4>Localização Privilegiada</h4>
                      <p>Na Represa de Jaguara, coração do turismo náutico</p>
                    </div>
                  </div>
                  <div className="about__feature">
                    <span className="about__feature-icon">
                      <Sun size={24} aria-hidden="true" />
                    </span>
                    <div>
                      <h4>Suporte Completo</h4>
                      <p>Documentação, manutenção e acessórios em um só lugar</p>
                    </div>
                  </div>
                </div>

                <Link to="/catalogo" className="btn btn--gold btn--lg about__cta">
                  Conheça Nosso Catálogo
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
              </div>

              <div className="about__gallery">
                <div className="about__gallery-main">
                  <img
                    src="/images/about/about-showroom.jpg"
                    alt="Showroom Lancha Jet Quadriciclo em Rifaina-SP"
                    className="about__gallery-image"
                    loading="lazy"
                    onError={(e) => { e.target.src = '/images/about/about-fallback.jpg'; }}
                  />
                </div>
                <div className="about__gallery-secondary">
                  <img
                    src="/images/about/about-lancha-water.jpg"
                    alt="Lancha na Represa de Jaguara"
                    className="about__gallery-image"
                    loading="lazy"
                    onError={(e) => { e.target.src = '/images/about/about-fallback-2.jpg'; }}
                  />
                  <img
                    src="/images/about/about-jetski-action.jpg"
                    alt="Jet ski em ação na represa"
                    className="about__gallery-image"
                    loading="lazy"
                    onError={(e) => { e.target.src = '/images/about/about-fallback-3.jpg'; }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== RIFAINA SECTION ===== */}
        <section id="rifaina" className="rifaina" aria-labelledby="rifaina-title">
          <div className="rifaina__background">
            <img
              src="/images/rifaina/rifaina-hero.jpg"
              alt="Vista panorâmica da Represa de Jaguara em Rifaina-SP"
              className="rifaina__bg-image"
              loading="lazy"
            />
            <div className="rifaina__overlay" />
          </div>

          <div className="container">
            <div className="rifaina__content">
              <header className="section-header section-header--light">
                <span className="section-header__eyebrow">Nosso Lar</span>
                <h2 id="rifaina-title" className="section-header__title">Rifaina. Onde a Liberdade Encontra a Água.</h2>
              </header>

              <div className="rifaina__text">
                <p>
                  <strong>Rifaina-SP</strong> é o destino perfeito para quem busca lazer náutico
                  de qualidade no interior de São Paulo. Banhada pela <strong>Represa de Jaguara</strong>,
                  a cidade oferece águas calmas, paisagens deslumbrantes e infraestrutura completa
                  para receber visitantes de todo o Brasil.
                </p>
                <p>
                  Aqui, a rotina dá lugar à aventura: passeios de lancha ao pôr do sol, adrenalina
                  no jet ski, trilhas de buggy pela mata ciliar e momentos de pura tranquilidade
                  nas praias de água doce. Cada visita é uma nova descoberta.
                </p>
              </div>

              <div className="rifaina__highlights">
                {rifainaHighlights.map((item, index) => (
                  <div key={item.title} className="rifaina__highlight" style={{ '--stagger-delay': `${(index + 1) * 100}ms` }}>
                    <div className="rifaina__highlight-icon">
                      <item.icon size={28} aria-hidden="true" />
                    </div>
                    <h3 className="rifaina__highlight-title">{item.title}</h3>
                    <p className="rifaina__highlight-desc">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="rifaina__cta">
                <Link to="/catalogo" className="btn btn--gold btn--lg">
                  Prepare sua Aventura em Rifaina
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CONTACT SECTION ===== */}
        <section id="contato" className="contact" aria-labelledby="contact-title">
          <div className="container">
            <header className="section-header">
              <span className="section-header__eyebrow">Fale Conosco</span>
              <h2 id="contact-title" className="section-header__title">Sua Próxima Aventura Começa Aqui</h2>
              <p className="section-header__description">
                Entre em contato com nossos especialistas. Estamos prontos para ajudar
                você a escolher o veículo ideal para seus momentos de lazer.
              </p>
            </header>

            <div className="contact__grid">
              {/* Contact Info */}
              <div className="contact__info">
                <div className="contact__card">
                  <h3 className="contact__card-title">Canais de Atendimento</h3>

                  <a
                    href={`https://wa.me/${siteConfig.contact.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact__channel contact__channel--whatsapp"
                  >
                    <div className="contact__channel-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <div className="contact__channel-content">
                      <span className="contact__channel-label">WhatsApp</span>
                      <span className="contact__channel-value">{siteConfig.contact.phone}</span>
                    </div>
                    <ArrowRight size={20} aria-hidden="true" />
                  </a>

                  <a
                    href="https://www.instagram.com/lanchajetquadriciclo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact__channel contact__channel--instagram"
                  >
                    <div className="contact__channel-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                    </div>
                    <div className="contact__channel-content">
                      <span className="contact__channel-label">Instagram</span>
                      <span className="contact__channel-value">@lanchajetquadriciclo</span>
                    </div>
                    <ArrowRight size={20} aria-hidden="true" />
                  </a>

                  <div className="contact__channel contact__channel--location">
                    <div className="contact__channel-icon">
                      <MapPin size={24} aria-hidden="true" />
                    </div>
                    <div className="contact__channel-content">
                      <span className="contact__channel-label">Endereço</span>
                      <span className="contact__channel-value">Av. Principal, Centro - Rifaina/SP</span>
                    </div>
                    <a
                      href="https://maps.google.com/?q=Rifaina,SP"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact__channel-map"
                    >
                      Ver no Maps
                      <ArrowRight size={16} aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <div className="contact__card contact__card--hours">
                  <h3 className="contact__card-title">Horário de Funcionamento</h3>
                  <ul className="contact__hours">
                    <li><span>Segunda a Sexta</span><span>08:00 - 18:00</span></li>
                    <li><span>Sábado</span><span>08:00 - 14:00</span></li>
                    <li><span>Domingo</span><span>Fechado</span></li>
                  </ul>
                </div>
              </div>

              {/* Contact Form */}
              <div className="contact__form-wrapper">
                <form className="contact__form" id="contact-form" noValidate>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">Nome Completo <span className="required" aria-hidden="true">*</span></label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-input"
                        placeholder="Seu nome"
                        required
                        autoComplete="name"
                        aria-required="true"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">Telefone/WhatsApp <span className="required" aria-hidden="true">*</span></label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="form-input"
                        placeholder="(16) 99999-9999"
                        required
                        autoComplete="tel"
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">E-mail</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-input"
                        placeholder="seu@email.com"
                        autoComplete="email"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="interest" className="form-label">Produto de Interesse</label>
                      <select id="interest" name="interest" className="form-select">
                        <option value="">Selecione uma categoria</option>
                        <option value="lanchas">Lanchas</option>
                        <option value="jet-skis">Jet Skis</option>
                        <option value="buggys">Buggys</option>
                        <option value="quadriciclos">Quadriciclos</option>
                        <option value="outro">Outro / Não sei ainda</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message" className="form-label">Mensagem <span className="required" aria-hidden="true">*</span></label>
                    <textarea
                      id="message"
                      name="message"
                      className="form-textarea"
                      placeholder="Conte-nos o que você procura, suas dúvidas ou como podemos ajudar..."
                      required
                      rows={5}
                      aria-required="true"
                    />
                  </div>

                  <button type="submit" className="btn btn--gold btn--lg btn--full contact__submit">
                    Enviar Mensagem
                    <ArrowRight size={20} aria-hidden="true" />
                  </button>

                  <p className="contact__disclaimer">
                    Ao enviar, você concorda com nossa <a href="/privacidade">Política de Privacidade</a>.
                    Responderemos em até 24h úteis.
                  </p>
                </form>
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