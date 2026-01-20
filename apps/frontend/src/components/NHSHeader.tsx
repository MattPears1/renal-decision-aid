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
    <header className="bg-gradient-to-r from-white via-white to-nhs-pale-grey border-b-4 border-nhs-blue shadow-md" role="banner">
      {/* Decorative top accent line */}
      <div className="h-1 bg-gradient-to-r from-nhs-blue via-nhs-aqua-green to-nhs-blue"></div>

      <div className="max-w-container-xl mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              aria-label={t('header.homeAriaLabel')}
              className="block no-underline focus:outline-none focus:ring-[3px] focus:ring-focus rounded-xl flex items-center gap-4 group"
            >
              {/* 3D Rotating Kidney Logo with blue border */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg ring-2 ring-nhs-blue ring-offset-1 group-hover:ring-nhs-aqua-green transition-all duration-300">
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

              {/* NHS (Demo) Badge - Enhanced */}
              <div className="flex flex-col gap-1">
                <div className="bg-gradient-to-r from-nhs-blue to-nhs-aqua-green rounded-lg px-4 py-1.5 shadow-md inline-flex items-baseline group-hover:shadow-lg transition-shadow">
                  <span className="text-white font-bold text-2xl tracking-wide">
                    {t('header.nhs')}
                  </span>
                  <span className="text-white font-bold text-sm ml-2 bg-white/20 px-2 py-0.5 rounded">
                    {t('header.demo')}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Decorative divider */}
          <div className="hidden sm:block h-12 w-px bg-gradient-to-b from-transparent via-nhs-mid-grey/30 to-transparent"></div>

          {/* Service Name - Enhanced */}
          <div className="flex flex-col gap-0.5">
            <span className="text-nhs-blue text-lg md:text-xl font-bold leading-tight tracking-tight">
              {t('header.serviceName')}
            </span>
            <span className="text-text-secondary text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-nhs-green rounded-full animate-pulse"></span>
              {t('header.tagline')}
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
