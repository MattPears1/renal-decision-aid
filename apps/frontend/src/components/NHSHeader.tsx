import { Link } from 'react-router-dom';
import { Suspense, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import LanguageSelector from './LanguageSelector';

// Mini 3D Kidney Model Component for Header
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
    <primitive
      ref={modelRef}
      object={clonedScene}
      position={[0, -0.8, 0]}
      scale={[1.2, 1.2, 1.2]}
    />
  );
}

// Preload the model
useGLTF.preload('/models/kidney.glb');

// Simple loading fallback
function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#CD5C5C" />
    </mesh>
  );
}

export default function NHSHeader() {
  const { t } = useTranslation();

  return (
    <header className="bg-gradient-to-r from-white via-white to-nhs-pale-grey border-b-4 border-nhs-blue shadow-md w-full overflow-x-hidden" role="banner">
      {/* Decorative top accent line */}
      <div className="h-1 bg-gradient-to-r from-nhs-blue via-nhs-aqua-green to-nhs-blue"></div>

      <div className="w-full max-w-container-xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 overflow-hidden box-border">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
          {/* Logo Section - Smaller on mobile */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              aria-label={t('header.homeAriaLabel')}
              className="block no-underline focus:outline-none focus:ring-[3px] focus:ring-focus rounded-xl flex items-center gap-2 sm:gap-3 md:gap-4 group min-h-[44px] touch-manipulation"
            >
              {/* 3D Rotating Kidney Logo with blue border - Responsive sizing */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg ring-2 ring-nhs-blue ring-offset-1 group-hover:ring-nhs-aqua-green transition-all duration-300 flex-shrink-0">
                <Canvas
                  camera={{ position: [0, 0.2, 1.6], fov: 50 }}
                  gl={{ antialias: true, alpha: true }}
                  style={{ background: 'transparent' }}
                >
                  <Suspense fallback={<LoadingFallback />}>
                    {/* Lighting */}
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[5, 5, 5]} intensity={1} />
                    <directionalLight position={[-5, -5, -5]} intensity={0.3} />
                    <pointLight position={[0, 5, 0]} intensity={0.4} />

                    {/* The 3D Kidney Model */}
                    <MiniKidneyModel />
                  </Suspense>
                </Canvas>
              </div>

              {/* NHS (Demo) Badge - Responsive sizing */}
              <div className="flex flex-col gap-0.5 sm:gap-1">
                <div className="bg-gradient-to-r from-nhs-blue to-nhs-aqua-green rounded-md sm:rounded-lg px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 shadow-md inline-flex items-baseline group-hover:shadow-lg transition-shadow">
                  <span className="text-white font-bold text-lg sm:text-xl md:text-2xl tracking-wide">
                    {t('header.nhs')}
                  </span>
                  <span className="text-white font-bold text-[10px] sm:text-xs md:text-sm ml-1 sm:ml-2 bg-white/20 px-1.5 sm:px-2 py-0.5 rounded">
                    {t('header.demo')}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Decorative divider - Hidden on mobile */}
          <div className="hidden md:block h-10 lg:h-12 w-px bg-gradient-to-b from-transparent via-nhs-mid-grey/30 to-transparent"></div>

          {/* Service Name - Hidden on xs, visible from sm up */}
          <div className="hidden sm:flex flex-col gap-0.5 min-w-0 flex-1 md:flex-none">
            <span className="text-nhs-blue text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-tight tracking-tight truncate">
              {t('header.serviceName')}
            </span>
            <span className="text-text-secondary text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-nhs-green rounded-full animate-pulse flex-shrink-0"></span>
              <span className="truncate">{t('header.tagline')}</span>
            </span>
          </div>

          {/* Spacer to push language selector to the right */}
          <div className="flex-grow" />

          {/* Language Selector Dropdown */}
          <LanguageSelector variant="dropdown" className="flex-shrink-0" />

        </div>
      </div>
    </header>
  );
}
