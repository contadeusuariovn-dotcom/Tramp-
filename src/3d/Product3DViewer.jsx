/**
 * Product3DViewer Component
 * Lancha Jet Quadriciclo - 3D Model Viewer for Phase 2
 *
 * This component prepares the architecture for future Blender/Three.js integration.
 * Currently shows a placeholder with fallback to product images.
 *
 * Phase 2 Implementation Notes:
 * - Replace placeholder with actual <Canvas> from @react-three/fiber
 * - Load .glb/.gltf models using useGLTF from @react-three/drei
 * - Add OrbitControls for rotation/zoom
 * - Add environment lighting (HDRI)
 * - Implement model switching for product variants
 * - Add loading states and error boundaries
 */

import { useState, useRef, useEffect } from 'react';
import { Box, Maximize, Minimize, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import './Product3DViewer.css';

/**
 * 3D Viewer Placeholder - Shows product images until 3D models are available
 * In Phase 2, this will be replaced with actual Three.js/React Three Fiber canvas
 */
function Product3DViewerPlaceholder({ product, className = '' }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const containerRef = useRef(null);

  const images = product.images?.length ? product.images : [product.thumbnail || '/images/products/placeholder-product.jpg'];

  const handleImageError = () => {
    setImageError(true);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
      if (e.key === 'Escape') setIsFullscreen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, images.length]);

  return (
    <div
      ref={containerRef}
      className={`product-3d-viewer product-3d-viewer--placeholder ${isFullscreen ? 'product-3d-viewer--fullscreen' : ''} ${className}`}
      role="region"
      aria-label={`Visualização de ${product.name}`}
      tabIndex={0}
    >
      {/* Image Viewport */}
      <div className="product-3d-viewer__viewport">
        {!imageError && (
          <img
            src={images[currentImageIndex]}
            alt={`${product.name} - Imagem ${currentImageIndex + 1} de ${images.length}`}
            className="product-3d-viewer__image"
            onError={handleImageError}
            loading="lazy"
          />
        )}

        {imageError && (
          <div className="product-3d-viewer__error">
            <AlertTriangle size={48} aria-hidden="true" />
            <p>Imagem não disponível</p>
            <span className="product-3d-viewer__error-hint">Modelo 3D será implementado na Fase 2</span>
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && !imageError && (
          <>
            <button
              className="product-3d-viewer__nav product-3d-viewer__nav--prev"
              onClick={prevImage}
              aria-label="Imagem anterior"
              disabled={images.length <= 1}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              className="product-3d-viewer__nav product-3d-viewer__nav--next"
              onClick={nextImage}
              aria-label="Próxima imagem"
              disabled={images.length <= 1}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* Image Indicators */}
        {images.length > 1 && !imageError && (
          <div className="product-3d-viewer__indicators" aria-label="Selecionar imagem">
            {images.map((_, index) => (
              <button
                key={index}
                className={`product-3d-viewer__indicator ${index === currentImageIndex ? 'product-3d-viewer__indicator--active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                aria-label={`Ver imagem ${index + 1}`}
                aria-current={index === currentImageIndex ? 'true' : 'false'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="product-3d-viewer__toolbar">
        <div className="product-3d-viewer__toolbar-left">
          <span className="product-3d-viewer__mode-badge">
            <ImageIcon size={14} aria-hidden="true" />
            Visualização 2D
          </span>
          {product.model3d && (
            <span className="product-3d-viewer__3d-ready">
              <Box size={14} aria-hidden="true" />
              Modelo 3D disponível
            </span>
          )}
        </div>

        <div className="product-3d-viewer__toolbar-right">
          <button
            className="product-3d-viewer__tool-btn"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
            title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>

          {/* Phase 2: 3D View Toggle */}
          {product.model3d && (
            <button
              className="product-3d-viewer__tool-btn product-3d-viewer__tool-btn--primary"
              disabled
              aria-label="Alternar para visualização 3D (em desenvolvimento)"
              title="Visualização 3D - Fase 2"
            >
              <Box size={20} />
              <span className="product-3d-viewer__tool-label">3D</span>
            </button>
          )}
        </div>
      </div>

      {/* Phase 2 Notice */}
      <div className="product-3d-viewer__phase-notice">
        <Box size={20} aria-hidden="true" />
        <div>
          <p className="product-3d-viewer__phase-title">Preparado para Visualização 3D</p>
          <p className="product-3d-viewer__phase-text">
            Este componente será atualizado na Fase 2 com integração Blender + Three.js/React Three Fiber
            para permitir rotação 360°, zoom, explodir componentes e visualização de detalhes.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Phase 2: Actual 3D Viewer Implementation Template
 *
 * This is a template for the actual 3D implementation.
 * Uncomment and implement when Phase 2 begins.
 */

/*
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Html, ContactShadows } from '@react-three/drei';
import { Suspense, useRef } from 'react';

// 3D Model Component
function ProductModel({ modelUrl, onLoad, onError, onProgress }) {
  const groupRef = useRef();
  const { scene, materials, animations } = useGLTF(modelUrl, {
    onLoad,
    onError,
    onProgress
  });

  useFrame((state, delta) => {
    // Auto-rotate when not interacting
    if (groupRef.current && !state.pointer.isDown) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

// 3D Viewer Canvas
function Product3DCanvas({ modelUrl, fallback }) {
  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 50 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      shadows
    >
      <Suspense fallback={fallback || <Loader3D />}>
        <Environment preset="city" background={false} />
        <ProductModel modelUrl={modelUrl} />
        <ContactShadows opacity={0.3} scale={10} blur={2} />
      </Suspense>
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={15}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}

// Loading Component
function Loader3D() {
  return (
    <Html center>
      <div className="product-3d-viewer__loading">
        <Loader2 className="product-3d-viewer__spinner" size={32} />
        <p>Carregando modelo 3D...</p>
      </div>
    </Html>
  );
}
*/

/**
 * Main Product3DViewer Component
 * Automatically chooses between placeholder and 3D viewer based on model availability
 */
export default function Product3DViewer({ product, className = '', priority: _priority = false }) {
  // In Phase 2, this will check for product.model3d and load the 3D viewer (Three.js / React Three Fiber)
  // For now, always use placeholder
  return (
    <Product3DViewerPlaceholder product={product} className={className} />
  );
}

/**
 * Hook for Phase 2: Preload 3D models
 *
export function usePreload3DModels(products) {
  const preload = useCallback((productIds) => {
    productIds.forEach(id => {
      const product = products.find(p => p.id === id);
      if (product?.model3d) {
        // preload GLTF
      }
    });
  }, [products]);

  return { preload };
}
*/

/**
 * Phase 2 Configuration Template
 *
export const viewer3DConfig = {
  // Default camera positions per category
  cameraPresets: {
    lanchas: { position: [0, 3, 8], fov: 45 },
    'jet-skis': { position: [0, 2, 5], fov: 50 },
    buggys: { position: [0, 2, 6], fov: 50 },
    quadriciclos: { position: [0, 1.5, 5], fov: 55 }
  },

  // Environment presets
  environments: {
    studio: 'studio',
    outdoor: 'city',
    water: 'sunset',
    showroom: 'warehouse'
  },

  // Model settings
  modelSettings: {
    autoRotate: true,
    autoRotateSpeed: 0.3,
    minZoom: 1.5,
    maxZoom: 20,
    enablePan: true,
    enableDamping: true,
    dampingFactor: 0.05
  },

  // Lighting
  lighting: {
    intensity: 1.5,
    color: 0xffffff,
    groundReflector: true,
    contactShadows: true
  }
};
*/