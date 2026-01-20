import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

// Anatomy annotation position data (labels come from translations)
const anatomyAnnotations = [
  {
    id: 'kidney',
    labelKey: 'modelViewer.anatomy.kidney.label',
    descriptionKey: 'modelViewer.anatomy.kidney.description',
    position: [0.8, 0.3, 0.5] as [number, number, number],
    targetPosition: [0.3, 0, 0.2] as [number, number, number],
    color: '#005eb8', // NHS Blue
  },
  {
    id: 'renal-artery',
    labelKey: 'modelViewer.anatomy.renalArtery.label',
    descriptionKey: 'modelViewer.anatomy.renalArtery.description',
    position: [-1.2, 0.8, 0.3] as [number, number, number],
    targetPosition: [-0.3, 0.5, 0.1] as [number, number, number],
    color: '#da291c', // Red for artery
  },
  {
    id: 'renal-vein',
    labelKey: 'modelViewer.anatomy.renalVein.label',
    descriptionKey: 'modelViewer.anatomy.renalVein.description',
    position: [-1.2, 0.2, 0.5] as [number, number, number],
    targetPosition: [-0.3, 0.2, 0.2] as [number, number, number],
    color: '#003087', // Dark blue for vein
  },
  {
    id: 'ureter',
    labelKey: 'modelViewer.anatomy.ureter.label',
    descriptionKey: 'modelViewer.anatomy.ureter.description',
    position: [0.8, -0.8, 0.3] as [number, number, number],
    targetPosition: [0.1, -0.5, 0.1] as [number, number, number],
    color: '#ffb81c', // NHS Yellow
  },
  {
    id: 'adrenal-gland',
    labelKey: 'modelViewer.anatomy.adrenalGland.label',
    descriptionKey: 'modelViewer.anatomy.adrenalGland.description',
    position: [-0.8, 1.2, 0.3] as [number, number, number],
    targetPosition: [0, 0.8, 0.1] as [number, number, number],
    color: '#78be20', // NHS Green
  },
];

// Icon components
const ArrowLeftIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const RotateIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const ZoomInIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
  </svg>
);

const ResetIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
  </svg>
);

// Annotation component with line and label
interface AnnotationProps {
  annotation: typeof anatomyAnnotations[0];
  isSelected: boolean;
  onClick: () => void;
  showLabels: boolean;
  modelOffset: [number, number, number];
  t: (key: string, options?: Record<string, unknown>) => string;
}

function Annotation({ annotation, isSelected, onClick, showLabels, modelOffset, t }: AnnotationProps) {
  // Adjust positions based on model offset
  const adjustedPosition: [number, number, number] = [
    annotation.position[0],
    annotation.position[1] + modelOffset[1],
    annotation.position[2],
  ];
  const adjustedTarget: [number, number, number] = [
    annotation.targetPosition[0],
    annotation.targetPosition[1] + modelOffset[1],
    annotation.targetPosition[2],
  ];

  // Get translated label and description
  const label = t(annotation.labelKey);
  const description = t(annotation.descriptionKey);

  if (!showLabels) return null;

  return (
    <group>
      {/* Line from label to target point */}
      <Line
        points={[adjustedPosition, adjustedTarget]}
        color={annotation.color}
        lineWidth={2}
        dashed={false}
      />

      {/* Target point marker */}
      <mesh position={adjustedTarget}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={annotation.color} />
      </mesh>

      {/* Label */}
      <Html
        position={adjustedPosition}
        center
        style={{
          transition: 'all 0.2s',
          pointerEvents: 'auto',
        }}
      >
        <div
          onClick={onClick}
          className={`cursor-pointer select-none transition-all duration-200 ${
            isSelected ? 'scale-110' : 'hover:scale-105'
          }`}
        >
          {/* Label pill */}
          <div
            className={`px-3 py-1.5 rounded-full text-white text-sm font-semibold shadow-lg whitespace-nowrap flex items-center gap-2 ${
              isSelected ? 'ring-2 ring-white ring-offset-2' : ''
            }`}
            style={{ backgroundColor: annotation.color }}
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {label}
          </div>

          {/* Description tooltip on selection */}
          {isSelected && (
            <div className="mt-2 bg-white rounded-lg shadow-xl p-3 max-w-[200px] text-left border-l-4"
              style={{ borderColor: annotation.color }}
            >
              <p className="text-xs text-gray-700 leading-relaxed">
                {description}
              </p>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// 3D Kidney Model Component
function KidneyModel({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const { scene } = useGLTF('/models/kidney.glb');
  const modelRef = useRef<THREE.Group>(null);

  // Clone the scene to avoid issues with reuse
  const clonedScene = scene.clone();


  return (
    <primitive
      ref={modelRef}
      object={clonedScene}
      position={position}
      scale={[2, 2, 2]}
    />
  );
}

// Preload the model
useGLTF.preload('/models/kidney.glb');

// Loading component for Suspense
function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-nhs-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-nhs-blue font-medium">Loading 3D Model...</p>
      </div>
    </Html>
  );
}

// Label icon
const TagIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
);

export default function ModelViewerPage() {
  const { t } = useTranslation();
  const [autoRotate, setAutoRotate] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);

  // Model offset for annotation positioning
  const modelOffset: [number, number, number] = [0, -1.5, 0];

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    setSelectedAnnotation(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-page to-nhs-pale-grey/30">
      {/* Breadcrumb Navigation - Enhanced */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-nhs-pale-grey sticky top-0 z-40" aria-label="Breadcrumb">
        <div className="container-page py-3">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link to="/" className="text-nhs-blue hover:text-nhs-blue-dark transition-colors">
                {t('nav.home', 'Home')}
              </Link>
            </li>
            <li className="text-nhs-mid-grey">/</li>
            <li>
              <Link to="/hub" className="text-nhs-blue hover:text-nhs-blue-dark transition-colors">
                {t('hub.title', 'Your Hub')}
              </Link>
            </li>
            <li className="text-nhs-mid-grey">/</li>
            <li className="text-text-secondary font-medium" aria-current="page">
              {t('modelViewer.breadcrumb', '3D Kidney Model')}
            </li>
          </ol>
        </div>
      </nav>

      {/* Header - Enhanced */}
      <header className="bg-gradient-to-r from-nhs-aqua-green to-[#008577] text-white py-6" role="banner">
        <div className="container-page">
          <div className="flex items-center justify-between">
            <Link
              to="/hub"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-xl"
              aria-label={t('modelViewer.backToHub', 'Back to hub')}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>{t('modelViewer.backToHub', 'Back to Hub')}</span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-white/80 text-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              Interactive 3D Model
            </div>
          </div>
        </div>
      </header>

      <main className="container-page py-8" role="main" aria-labelledby="model-viewer-title">
        {/* Title Section - Enhanced */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-nhs-aqua-green/10 rounded-full text-sm font-medium text-nhs-aqua-green mb-4">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
            </svg>
            Interactive Learning Tool
          </div>
          <h1
            id="model-viewer-title"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4"
          >
            {t('modelViewer.title', '3D Kidney Model Viewer')}
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            {t('modelViewer.interactiveDescription',
              'Explore an interactive 3D model of human kidneys. Use your mouse or touch to rotate and zoom.'
            )}
          </p>
        </div>

        {/* 3D Viewer Container - Enhanced */}
        <div className="bg-white rounded-2xl shadow-xl border border-nhs-pale-grey overflow-hidden mb-8">
          {/* Control Bar - Enhanced */}
          <div className="bg-gradient-to-r from-slate-50 to-white border-b border-nhs-pale-grey px-4 md:px-6 py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-nhs-blue/5 rounded-lg">
                  <RotateIcon className="w-4 h-4 text-nhs-blue" />
                  <span>{t('modelViewer.dragToRotate', 'Drag to rotate')}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-nhs-blue/5 rounded-lg">
                  <ZoomInIcon className="w-4 h-4 text-nhs-blue" />
                  <span>{t('modelViewer.scrollToZoom', 'Scroll to zoom')}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLabels(!showLabels)}
                  className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    showLabels
                      ? 'bg-nhs-green text-white shadow-md'
                      : 'bg-white text-text-primary border-2 border-nhs-pale-grey hover:border-nhs-green hover:bg-nhs-green/5'
                  }`}
                  aria-pressed={showLabels}
                >
                  <TagIcon className="w-4 h-4" />
                  {showLabels ? t('modelViewer.labelsOn', 'Labels: On') : t('modelViewer.labelsOff', 'Labels: Off')}
                </button>
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    autoRotate
                      ? 'bg-nhs-blue text-white shadow-md'
                      : 'bg-white text-text-primary border-2 border-nhs-pale-grey hover:border-nhs-blue hover:bg-nhs-blue/5'
                  }`}
                  aria-pressed={autoRotate}
                >
                  <RotateIcon className="w-4 h-4" />
                  {autoRotate ? t('modelViewer.autoRotateOn', 'Auto-Rotate: On') : t('modelViewer.autoRotateOff', 'Auto-Rotate: Off')}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-white text-text-primary border-2 border-nhs-pale-grey hover:border-nhs-mid-grey hover:bg-nhs-pale-grey transition-all duration-200 flex items-center gap-2"
                  aria-label={t('modelViewer.resetView', 'Reset view')}
                >
                  <ResetIcon className="w-4 h-4" />
                  {t('modelViewer.reset', 'Reset')}
                </button>
              </div>
            </div>
          </div>

          {/* 3D Canvas */}
          <div className="h-[500px] md:h-[600px] bg-gradient-to-b from-slate-100 to-slate-200">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
            >
              <Suspense fallback={<LoadingSpinner />}>
                {/* Lighting */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <directionalLight position={[-10, -10, -5]} intensity={0.4} />
                <pointLight position={[0, 10, 0]} intensity={0.5} />

                {/* Environment for better reflections */}
                <Environment preset="studio" />

                {/* The 3D Model - lowered on Y axis to center in viewport */}
                <KidneyModel position={modelOffset} />

                {/* Anatomy Annotations */}
                {anatomyAnnotations.map((annotation) => (
                  <Annotation
                    key={annotation.id}
                    annotation={annotation}
                    isSelected={selectedAnnotation === annotation.id}
                    onClick={() => {
                      setSelectedAnnotation(
                        selectedAnnotation === annotation.id ? null : annotation.id
                      );
                      setAutoRotate(false); // Stop rotation when clicking a label
                    }}
                    showLabels={showLabels}
                    modelOffset={modelOffset}
                    t={t}
                  />
                ))}

                {/* Controls */}
                <OrbitControls
                  ref={controlsRef}
                  autoRotate={autoRotate}
                  autoRotateSpeed={0.8}
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={0.5}
                  maxDistance={20}
                  minPolarAngle={0}
                  maxPolarAngle={Math.PI}
                />
              </Suspense>
            </Canvas>
          </div>
        </div>

        {/* Information Cards - Enhanced */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="group bg-white rounded-2xl p-6 shadow-sm border border-nhs-pale-grey hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-nhs-blue/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-nhs-blue/20 transition-colors">
              <svg className="w-7 h-7 text-nhs-blue" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <h3 className="font-bold text-lg text-text-primary mb-2">
              {t('modelViewer.aboutKidneys', 'About Your Kidneys')}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t('modelViewer.kidneyInfo',
                'Your kidneys are bean-shaped organs about the size of your fist. They filter about 200 litres of blood daily, removing waste and extra fluid.'
              )}
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-6 shadow-sm border border-nhs-pale-grey hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-nhs-green/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-nhs-green/20 transition-colors">
              <svg className="w-7 h-7 text-nhs-green" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h3 className="font-bold text-lg text-text-primary mb-2">
              {t('modelViewer.kidneyFunction', 'What Kidneys Do')}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t('modelViewer.functionInfo',
                'Kidneys regulate blood pressure, produce hormones, balance body fluids, and filter waste products into urine.'
              )}
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-6 shadow-sm border border-nhs-pale-grey hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-nhs-warm-yellow/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-nhs-warm-yellow/20 transition-colors">
              <svg className="w-7 h-7 text-nhs-warm-yellow" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
            </div>
            <h3 className="font-bold text-lg text-text-primary mb-2">
              {t('modelViewer.whenKidneysFail', 'When Kidneys Fail')}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t('modelViewer.failureInfo',
                'When kidneys lose function, treatments like dialysis or transplant can help do the work your kidneys can no longer do.'
              )}
            </p>
          </div>
        </div>

        {/* Navigation Links - Enhanced */}
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-nhs-pale-grey max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {t('modelViewer.learnMore', 'Learn More About Treatment Options')}
            </h2>
            <p className="text-text-secondary">Continue your journey by exploring treatment options</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link
              to="/treatments"
              className="group flex-1 text-center px-8 py-4 bg-gradient-to-r from-nhs-blue to-nhs-blue-dark text-white font-bold rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-focus focus:ring-offset-2"
            >
              <span className="flex items-center justify-center gap-2">
                {t('modelViewer.exploreTreatments', 'Explore Treatments')}
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </span>
            </Link>
            <Link
              to="/compare"
              className="flex-1 text-center px-8 py-4 bg-white text-nhs-blue font-bold rounded-xl border-2 border-nhs-blue hover:bg-nhs-blue hover:text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-focus focus:ring-offset-2"
            >
              {t('modelViewer.compareTreatments', 'Compare Treatments')}
            </Link>
          </div>
          <div className="text-center pt-6 border-t border-nhs-pale-grey">
            <Link
              to="/hub"
              className="inline-flex items-center gap-2 text-nhs-blue font-medium hover:bg-nhs-blue/5 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {t('nav.backToHub', 'Back to Your Hub')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
