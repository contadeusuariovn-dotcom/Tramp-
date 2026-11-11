/**
 * Catalog Page
 * Lancha Jet Quadriciclo - Product Catalog with Filters
 */

import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Grid,
  List,
  Loader2,
  Anchor,
  Waves,
  Car,
  Bike
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import ProductCard from '../components/ProductCard';
import { products, searchProducts, getCategoriesWithCounts } from '../data/products';
import { siteConfig } from '../config/site.config';
import './Catalog.css';

const categoryConfig = [
  { id: 'all', label: 'Todos', icon: Grid, count: products.length },
  { id: 'lanchas', label: 'Lanchas', icon: Anchor, count: getCategoriesWithCounts().find(c => c.id === 'lanchas')?.count || 0 },
  { id: 'jet-skis', label: 'Jet Skis', icon: Waves, count: getCategoriesWithCounts().find(c => c.id === 'jet-skis')?.count || 0 },
  { id: 'buggys', label: 'Buggys', icon: Car, count: getCategoriesWithCounts().find(c => c.id === 'buggys')?.count || 0 },
  { id: 'quadriciclos', label: 'Quadriciclos', icon: Bike, count: getCategoriesWithCounts().find(c => c.id === 'quadriciclos')?.count || 0 }
];

const sortOptions = [
  { value: 'featured', label: 'Destaques primeiro' },
  { value: 'name-asc', label: 'Nome (A-Z)' },
  { value: 'name-desc', label: 'Nome (Z-A)' },
  { value: 'year-desc', label: 'Ano (Mais novos)' },
  { value: 'year-asc', label: 'Ano (Mais antigos)' },
  { value: 'price-asc', label: 'Preço (Menor)' },
  { value: 'price-desc', label: 'Preço (Maior)' }
];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (sortBy !== 'featured') params.set('sort', sortBy);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, sortBy, setSearchParams]);

  // Sync filters when the URL params change externally — ex.: clicar em
  // "Lanchas/Jet Skis/Buggys/Quadriciclos" no menu enquanto o catalogo
  // ja esta aberto (antes disso o filtro ignorava a mudanca de URL).
  // setState aqui e propositado: a URL e um sistema externo ao React.
  /* oxlint-disable set-state-in-effect */
  useEffect(() => {
    const urlCategory = searchParams.get('category') || 'all';
    const urlSort = searchParams.get('sort') || 'featured';
    const urlSearch = searchParams.get('search') || '';
    setSelectedCategory((prev) => (prev === urlCategory ? prev : urlCategory));
    setSortBy((prev) => (prev === urlSort ? prev : urlSort));
    setSearchQuery((prev) => (prev === urlSearch ? prev : urlSearch));
  }, [searchParams]);
  /* oxlint-enable set-state-in-effect */

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products;

    // Search
    if (searchQuery.trim()) {
      result = searchProducts(searchQuery);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'year-desc':
          return (b.year || 0) - (a.year || 0);
        case 'year-asc':
          return (a.year || 0) - (b.year || 0);
        case 'price-asc':
          return (a.price || Infinity) - (b.price || Infinity);
        case 'price-desc':
          return (b.price || -Infinity) - (a.price || -Infinity);
        case 'featured':
        default:
          // Featured first, then by name
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

  // Simulate loading for better UX
  const handleFilterChange = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 150);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('featured');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || sortBy !== 'featured';

  return (
    <>
      <Header />

      <main id="main-content" className="catalog-page">
        {/* Page Header */}
        <section className="catalog__hero">
          <div className="catalog__hero-bg">
            <img
              src="/images/catalog/catalog-hero.jpg"
              alt="Catálogo de produtos Lancha Jet Quadriciclo"
              className="catalog__hero-image"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="catalog__hero-overlay" />
          </div>
          <div className="container">
            <div className="catalog__hero-content">
              <h1 className="catalog__hero-title">Catálogo Completo</h1>
              <p className="catalog__hero-subtitle">
                Explore nossa seleção de lanchas, jet skis, buggys e quadriciclos.
                Encontre o veículo perfeito para sua aventura em Rifaina-SP.
              </p>
            </div>
          </div>
        </section>

        {/* Filters & Toolbar */}
        <section className="catalog__toolbar-section">
          <div className="container">
            <div className="catalog__toolbar">
              {/* Search */}
              <div className="catalog__search">
                <label htmlFor="catalog-search" className="sr-only">Buscar produtos</label>
                <div className="catalog__search-input-wrapper">
                  <Search className="catalog__search-icon" aria-hidden="true" />
                  <input
                    id="catalog-search"
                    type="search"
                    className="catalog__search-input"
                    placeholder="Buscar por nome, marca, modelo..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange(); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
                  />
                  {searchQuery && (
                    <button
                      className="catalog__search-clear"
                      onClick={() => { setSearchQuery(''); handleFilterChange(); }}
                      aria-label="Limpar busca"
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filters */}
              <div className="catalog__categories" role="group" aria-label="Filtrar por categoria">
                {categoryConfig.map((cat) => (
                  <button
                    key={cat.id}
                    className={`catalog__category-btn ${selectedCategory === cat.id ? 'catalog__category-btn--active' : ''}`}
                    onClick={() => { setSelectedCategory(cat.id); handleFilterChange(); }}
                    aria-pressed={selectedCategory === cat.id}
                  >
                    <cat.icon size={18} aria-hidden="true" />
                    <span>{cat.label}</span>
                    {cat.count > 0 && <span className="catalog__category-count">{cat.count}</span>}
                  </button>
                ))}
              </div>

              {/* Sort & View */}
              <div className="catalog__actions">
                <div className="catalog__sort">
                  <label htmlFor="catalog-sort" className="sr-only">Ordenar por</label>
                  <select
                    id="catalog-sort"
                    className="catalog__sort-select"
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); handleFilterChange(); }}
                  >
                    {sortOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="catalog__sort-icon" aria-hidden="true" />
                </div>

                <div className="catalog__view" role="group" aria-label="Modo de visualização">
                  <button
                    className={`catalog__view-btn ${viewMode === 'grid' ? 'catalog__view-btn--active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    aria-pressed={viewMode === 'grid'}
                    aria-label="Visualização em grade"
                  >
                    <Grid size={20} aria-hidden="true" />
                  </button>
                  <button
                    className={`catalog__view-btn ${viewMode === 'list' ? 'catalog__view-btn--active' : ''}`}
                    onClick={() => setViewMode('list')}
                    aria-pressed={viewMode === 'list'}
                    aria-label="Visualização em lista"
                  >
                    <List size={20} aria-hidden="true" />
                  </button>
                </div>

                {/* Mobile Filters Toggle */}
                <button
                  className="catalog__mobile-filters"
                  onClick={() => setShowFilters(!showFilters)}
                  aria-expanded={showFilters}
                  aria-controls="mobile-filters"
                >
                  <Filter size={20} aria-hidden="true" />
                  <span>Filtros</span>
                  {hasActiveFilters && <span className="catalog__filters-badge">{[
                    searchQuery && 1,
                    selectedCategory !== 'all' && 1,
                    sortBy !== 'featured' && 1
                  ].filter(Boolean).length}</span>}
                </button>
              </div>
            </div>

            {/* Mobile Filters Panel */}
            <div
              id="mobile-filters"
              className={`catalog__mobile-filters ${showFilters ? 'catalog__mobile-filters--open' : ''}`}
            >
              <div className="catalog__mobile-filters-content">
                <div className="catalog__mobile-filters-header">
                  <h3>Filtros Ativos</h3>
                  <button
                    className="catalog__mobile-filters-close"
                    onClick={() => setShowFilters(false)}
                    aria-label="Fechar filtros"
                  >
                    <X size={20} aria-hidden="true" />
                  </button>
                </div>

                <div className="catalog__mobile-filter-group">
                  <label htmlFor="mobile-category" className="form-label">Categoria</label>
                  <select
                    id="mobile-category"
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); handleFilterChange(); setShowFilters(false); }}
                  >
                    {categoryConfig.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.count > 0 ? `${cat.label} (${cat.count})` : cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="catalog__mobile-filter-group">
                  <label htmlFor="mobile-sort" className="form-label">Ordenação</label>
                  <select
                    id="mobile-sort"
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); handleFilterChange(); setShowFilters(false); }}
                  >
                    {sortOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    className="btn btn--secondary btn--full catalog__clear-filters"
                    onClick={clearFilters}
                  >
                    <X size={18} aria-hidden="true" />
                    Limpar todos os filtros
                  </button>
                )}
              </div>
            </div>

            {/* Results Info */}
            <div className="catalog__results-info" aria-live="polite">
              <span className="catalog__results-count">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </span>
              {hasActiveFilters && (
                <button className="catalog__clear-all" onClick={clearFilters}>
                  <X size={16} aria-hidden="true" />
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="catalog__products" aria-labelledby="products-title">
          <div className="container">
            <h2 id="products-title" className="sr-only">Produtos</h2>

            {isLoading && (
              <div className="catalog__loading" role="status" aria-label="Carregando produtos">
                <Loader2 className="catalog__spinner" size={32} aria-hidden="true" />
                <span>Carregando...</span>
              </div>
            )}

            {filteredProducts.length > 0 ? (
              <div
                className={`catalog__grid ${viewMode === 'list' ? 'catalog__grid--list' : ''}`}
                role="list"
              >
                {filteredProducts.map((product, index) => (
                  <div key={product.id} className="catalog__grid-item" style={{ '--item-index': index }}>
                    <ProductCard
                      product={product}
                      variant={viewMode === 'list' ? 'compact' : 'default'}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="catalog__empty">
                <Filter size={64} aria-hidden="true" />
                <h3>Nenhum produto encontrado</h3>
                <p>
                  {searchQuery
                    ? `Nenhum resultado para "${searchQuery}".`
                    : 'Ainda não temos produtos publicados nesta categoria — em breve novidades!'}
                </p>
                <div className="catalog__empty-actions">
                  <button
                    className="btn btn--primary"
                    onClick={clearFilters}
                  >
                    <X size={18} aria-hidden="true" />
                    Limpar filtros e ver todos
                  </button>
                  <a
                    className="btn btn--gold"
                    href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de ajuda para encontrar o produto ideal.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Falar no WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="catalog__cta">
          <div className="container">
            <div className="catalog__cta-content">
              <h2>Não encontrou o que procura?</h2>
              <p>Nossa equipe pode ajudar a encontrar o modelo ideal ou encomendar sob medida.</p>
              <div className="catalog__cta-actions">
                <a
                  href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de ajuda para encontrar o produto ideal.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--gold btn--lg"
                >
                  Falar com Especialista
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