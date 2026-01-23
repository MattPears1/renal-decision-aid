/**
 * @fileoverview NHS-branded header component for the Renal Decision Aid.
 * Features a rotating 3D kidney logo, service branding, and language selector.
 * @module components/NHSHeader
 * @version 2.5.0
 * @since 1.0.0
 * @lastModified 21 January 2026
 */

import { Link } from 'react-router-dom';
import { Suspense, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import LanguageSelector from './LanguageSelector';

/**
 * Mini 3D kidney model component for the header logo.
 * Renders a slowly rotating kidney model.
 * @component
 * @returns {JSX.Element} The rendered 3D model
 */
function MiniKidneyModel() {
  const { scene } = useGLTF('/models/kidney.glb');
  const modelRef = useRef<THREE.Group>(null);

  // Clone the scene to avoid issues with reuse
  const clonedScene = scene.clone();

  // Slow rotation on Y axis (like a kebab)
  useFrame((_, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.5; // Slow rotation speed
    }
  });

  return (
    /* eslint-disable react/no-unknown-property */
    <primitive
      ref={modelRef}
      object={clonedScene}
      position={[0, -0.8, 0]}
      scale={[1.2, 1.2, 1.2]}
    />
    /* eslint-enable react/no-unknown-property */
  );
}

/** Preload the 3D model for faster initial render. */
useGLTF.preload('/models/kidney.glb');

/**
 * Simple loading fallback for when the 3D model is loading.
 * Displays a static sphere placeholder.
 * @component
 * @returns {JSX.Element} The rendered fallback mesh
 */
function LoadingFallback() {
  return (
    <mesh>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#CD5C5C" />
    </mesh>
  );
}

/**
 * NHS-branded sticky header component.
 *
 * Features:
 * - Sticky positioning with high z-index
 * - NHS gradient branding with demo badge
 * - Rotating 3D kidney logo
 * - Service name and tagline
 * - Language selector dropdown
 * - Responsive design for mobile/desktop
 *
 * @component
 * @returns {JSX.Element} The rendered header
 *
 * @example
 * <NHSHeader />
 */
export default function NHSHeader() {
  const { t } = useTranslation();

  return (
    <header
      className="sticky top-0 z-[500] bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm w-full"
      role="banner"
    >
      <div className="w-full max-w-container-xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 box-border">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo + Title Section */}
          <Link
            to="/"
            aria-label={t('header.homeAriaLabel')}
            className="flex items-center gap-2.5 sm:gap-3 no-underline focus:outline-none focus:ring-[3px] focus:ring-focus rounded-lg group min-h-[44px] touch-manipulation min-w-0"
          >
            {/* 3D Rotating Kidney Logo */}
            <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full overflow-hidden bg-slate-50 shadow-sm ring-1 ring-slate-200 group-hover:ring-slate-300 group-hover:shadow-md transition-all duration-300 flex-shrink-0">
              <Canvas
                camera={{ position: [0, 0.2, 1.6], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
              >
                <Suspense fallback={<LoadingFallback />}>
                  {/* eslint-disable react/no-unknown-property */}
                  <ambientLight intensity={0.7} />
                  <directionalLight position={[5, 5, 5]} intensity={1} />
                  <directionalLight position={[-5, -5, -5]} intensity={0.3} />
                  <pointLight position={[0, 5, 0]} intensity={0.4} />
                  {/* eslint-enable react/no-unknown-property */}
                  <MiniKidneyModel />
                </Suspense>
              </Canvas>
            </div>

            {/* Title + Tagline */}
            <div className="flex flex-col min-w-0">
              <span className="text-slate-800 text-sm sm:text-base md:text-lg font-semibold leading-tight truncate">
                {t('header.serviceName')}
              </span>
              <span className="hidden sm:block text-slate-500 text-xs md:text-sm leading-tight truncate">
                {t('header.tagline')}
              </span>
            </div>
          </Link>

          {/* Language Selector Dropdown */}
          <LanguageSelector variant="dropdown" className="flex-shrink-0" />
        </div>
      </div>
    </header>
  );
}
