/**
 * Site Configuration
 * Centralized configuration for Lancha Jet Quadriciclo
 */

export const siteConfig = {
  name: 'Lancha Jet Quadriciclo',
  tagline: 'SEU PRÓXIMO DESTINO COMEÇA NA ÁGUA',
  description: 'Lanchas, jet skis e veículos recreativos para transformar seus momentos de lazer em experiências inesquecíveis em Rifaina-SP.',

  // Contact Information
  contact: {
    phone: '(16) 99401-3303', // Número confirmado via Instagram oficial
    whatsapp: '5516994013303', // Número confirmado via Instagram oficial
    email: 'contato@lanchajetquadriciclo.com.br',
    address: {
      street: 'Av. Principal', // Placeholder
      neighborhood: 'Centro',
      city: 'Rifaina',
      state: 'SP',
      cep: '14530-000'
    },
    instagram: 'https://www.instagram.com/lanchajetquadriciclo',
    mapsUrl: 'https://maps.google.com/?q=Rifaina,SP' // Placeholder
  },

  // Business Hours
  businessHours: {
    weekdays: '08:00 - 18:00',
    saturday: '08:00 - 14:00',
    sunday: 'Fechado'
  },

  // SEO
  seo: {
    title: 'Lancha Jet Quadriciclo | Lanchas, Jet Skis e Veículos Recreativos em Rifaina-SP',
    description: 'Conheça nosso catálogo de lanchas, jet skis, buggys e quadriciclos. Sua próxima aventura na Represa de Jaguara começa aqui.',
    keywords: 'lanchas, jet ski, quadriciclo, buggy, Rifaina, Represa de Jaguara, veículos recreativos, náutica',
    ogImage: '/og-image.jpg',
    twitterHandle: '@lanchajetquadriciclo'
  },

  // Theme Colors
  theme: {
    colors: {
      navy: '#071B2C',
      ocean: '#123B56',
      white: '#FFFFFF',
      lightGray: '#F3F5F6',
      gold: '#C5A46D',
      goldLight: '#D4B88C',
      goldDark: '#A88A5B'
    },
    fonts: {
      heading: '"Montserrat", "Outfit", sans-serif',
      body: '"Inter", "Manrope", sans-serif'
    }
  },

  // Categories
  categories: [
    { id: 'all', label: 'Todos', icon: 'grid' },
    { id: 'lanchas', label: 'Lanchas', icon: 'anchor' },
    { id: 'jet-skis', label: 'Jet Skis', icon: 'waves' },
    { id: 'buggys', label: 'Buggys', icon: 'car' },
    { id: 'quadriciclos', label: 'Quadriciclos', icon: 'bike' }
  ],

  // Default product placeholders
  placeholderImage: '/images/products/placeholder-product.jpg',
  placeholder3D: '/placeholder-3d.glb'
};

export default siteConfig;