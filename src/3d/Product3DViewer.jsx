/**
 * Product3DViewer Component
 * Lancha Jet Quadriciclo
 *
 * Visualizador de modelos 3D (GLB) com a galeria de fotos como padrao.
 * O modo 3D e opt-in via botao "3D" na toolbar.
 *
 * - Canvas react-three-fiber + OrbitControls (drei)
 * - Iluminacao própria (ambient/hemi/directional) + ContactShadows — sem HDRI/CDN
 * - Auto-enquadramento pelo bounding box do modelo
 * - Erro de carregamento → volta para fotos automaticamente
 */

import { useState, useRef, useEffect, useMemo, Suspense, Component } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, useGLTF, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { Box, Maximize, Minimize, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import './Product3DViewer.css';

/* ------------------------------------------------------------------ */
/* Error boundary: se o GLB falhar (404, WebGL indisponivel etc.)      */
/* avisa o pai para cair na galeria de fotos                           */
/* ------------------------------------------------------------------ */

class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn('[3D] Falha ao carregar modelo:', error);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

/* ------------------------------------------------------------------ */
/* Cena 3D: modelo auto-enquadrado + luzes + sombra de contato         */
/* ------------------------------------------------------------------ */

function frameCamera(cam, ctl, center, maxDim) {
  const dir = new THREE.Vector3(0.55, 0.42, 1.0).normalize();
  cam.position.copy(center).addScaledVector(dir, maxDim * 2.1);
  if (ctl) {
    ctl.target.copy(center);
    ctl.minDistance = maxDim * 1.0;
    ctl.maxDistance = maxDim * 4.5;
    ctl.update();
  }
}

function Product3DScene({ url }) {
  const gltf = useGLTF(url);
  const three = useThree();

  const { center, maxDim } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    return { center: c, maxDim: Math.max(size.x, size.y, size.z) || 1 };
  }, [gltf.scene]);

  useEffect(() => {
    frameCamera(three.camera, three.controls, center, maxDim);
  }, [three, center, maxDim]);

  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#e8f2f6', '#9aa0a4', 0.5]} />
      <directionalLight
        position={[maxDim * 0.9, maxDim * 1.4, maxDim * 1.1]}
        intensity={1.5}
      />
      <directionalLight
        position={[-maxDim, maxDim * 0.6, -maxDim * 0.8]}
        intensity={0.45}
        color="#dfe9f2"
      />
      <primitive object={gltf.scene} />
      <ContactShadows
        position={[center.x, 0.001, center.z]}
        scale={maxDim * 2.6}
        blur={2.4}
        opacity={0.38}
        far={maxDim * 0.8}
        resolution={1024}
        frames={1}
        color="#2a3138"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas 3D                                                          */
/* ------------------------------------------------------------------ */

function Product3DCanvas({ url }) {
  return (
    <Canvas
      camera={{ fov: 40, position: [6, 4, 8], near: 0.05, far: 2000 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      className="product-3d-viewer__canvas"
    >
      <Suspense fallback={null}>
        <Product3DScene url={url} />
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        enableRotate
        autoRotate
        autoRotateSpeed={0.9}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/* Galeria de fotos (modo 2D)                                         */
/* ------------------------------------------------------------------ */

function ProductImageGallery({ product, currentImageIndex, setCurrentImageIndex }) {
  const [imageError, setImageError] = useState(false);
  const touchStart = useRef(null);

  const images = product.images?.length
    ? product.images
    : [product.thumbnail || '/images/products/placeholder-product.jpg'];

  const handleImageError = () => setImageError(true);

  const goTo = (index) => {
    setCurrentImageIndex(index);
    setImageError(false);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    goTo((currentImageIndex + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    goTo((currentImageIndex - 1 + images.length) % images.length);
  };

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e) => {
    if (!touchStart.current || images.length <= 1) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) goTo((currentImageIndex + 1) % images.length);
      else goTo((currentImageIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <div
      className="product-3d-viewer__viewport product-3d-viewer__viewport--gallery"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
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
        </div>
      )}

      {images.length > 1 && !imageError && (
        <>
          <button
            className="product-3d-viewer__nav product-3d-viewer__nav--prev"
            onClick={prevImage}
            aria-label="Imagem anterior"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className="product-3d-viewer__nav product-3d-viewer__nav--next"
            onClick={nextImage}
            aria-label="Próxima imagem"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {images.length > 1 && !imageError && (
        <div className="product-3d-viewer__indicators" aria-label="Selecionar imagem">
          {images.map((_, index) => (
            <button
              key={index}
              className={`product-3d-viewer__indicator ${index === currentImageIndex ? 'product-3d-viewer__indicator--active' : ''}`}
              onClick={(e) => { e.stopPropagation(); goTo(index); }}
              aria-label={`Ver imagem ${index + 1}`}
              aria-current={index === currentImageIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                */
/* ------------------------------------------------------------------ */

export default function Product3DViewer({ product, className = '' }) {
  // Fotos primeiro: 3D fica opt-in via botao (nao abre por padrao)
  const [mode, setMode] = useState('2d');
  const [failed, setFailed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const containerRef = useRef(null);

  const has3d = Boolean(product.model3d) && !failed;
  const show3d = mode === '3d' && has3d;

  const { active, progress } = useProgress();

  // Precarrega o GLB para a troca ser instantanea
  useEffect(() => {
    if (product.model3d) {
      useGLTF.preload(product.model3d);
    }
  }, [product.model3d]);

  const handleModelFail = () => {
    setFailed(true);
    setMode('2d');
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

  return (
    <div
      ref={containerRef}
      className={`product-3d-viewer ${isFullscreen ? 'product-3d-viewer--fullscreen' : ''} ${className}`}
      role="region"
      aria-label={`Visualização de ${product.name}`}
      tabIndex={0}
    >
      {show3d ? (
        <ModelErrorBoundary onError={handleModelFail}>
          <div className="product-3d-viewer__canvas-container" key={product.model3d}>
            <Product3DCanvas url={product.model3d} />
          </div>
        </ModelErrorBoundary>
      ) : (
        <ProductImageGallery
          product={product}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
        />
      )}

      {/* Overlay de carregamento do GLB */}
      {show3d && active && (
        <div className="product-3d-viewer__loading" aria-live="polite">
          <span className="product-3d-viewer__spinner" aria-hidden="true" />
          <p>Carregando modelo 3D… {Math.round(progress)}%</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="product-3d-viewer__toolbar">
        <div className="product-3d-viewer__toolbar-left">
          {show3d ? (
            <span className="product-3d-viewer__mode-badge product-3d-viewer__mode-badge--3d">
              <Box size={14} aria-hidden="true" />
              Visualização 3D — arraste para girar
            </span>
          ) : (
            <span className="product-3d-viewer__mode-badge">
              <ImageIcon size={14} aria-hidden="true" />
              Visualização 2D
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

          {product.model3d && !failed && (
            <button
              className="product-3d-viewer__tool-btn product-3d-viewer__tool-btn--primary"
              onClick={() => setMode(show3d ? '2d' : '3d')}
              aria-label={show3d ? 'Ver fotos do produto' : 'Ver modelo em 3D'}
              title={show3d ? 'Ver fotos' : 'Ver em 3D'}
            >
              {show3d ? <ImageIcon size={20} /> : <Box size={20} />}
              <span className="product-3d-viewer__tool-label">
                {show3d ? 'Fotos' : '3D'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
