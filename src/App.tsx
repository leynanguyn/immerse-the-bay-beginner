import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Controllers, Hands, XR } from '@react-three/xr';

import './App.css';
import CenterDashboard from './components/CenterDashboard';
import LeftTonePanel, { type ToneType } from './components/LeftTonePanel';
import Robot3DScene from './components/Robot3DScene';
import SpatialDashboard from './components/spatial/SpatialDashboard';
import SpatialToneSelector from './components/spatial/SpatialToneSelector';
import ImmersiveRobot from './components/spatial/ImmersiveRobot';
import XRControllerActions from './components/spatial/XRControllerActions';
import { useTherapyState, getComponentVisibility } from './app-shell/TherapyStateController';
import { TherapyStateProvider } from './app-shell/TherapyStateProvider';
import { initializeAudioSystem } from './audio/initializeAudio';
import { useXRSession } from './xr/XRSessionManager';
import { useXRInputSources } from './xr/XRInputHandler';

/**
 * Main App Component (Inner)
 * Contains the UI logic that needs access to therapy state context
 */
function AppContent() {
  const { currentState, startTherapy, exitTherapy } = useTherapyState();
  const [selectedTone, setSelectedTone] = useState<ToneType>('Friendly');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const { showDashboard, showRobotScene } = getComponentVisibility(currentState);
  const therapyActive = currentState === 'active_therapy';

  const xrSession = useXRSession();
  useXRInputSources(xrSession.session);

  // Initialize audio system on mount
  useEffect(() => {
    initializeAudioSystem();
  }, []);

  /**
   * Handle tone selection change
   * Updates the selected tone when user clicks a tone button
   */
  const handleToneChange = (tone: ToneType) => {
    setSelectedTone(tone);
    console.log(`[App] Tone changed to: ${tone}`);
    setStatusMessage(`Tone set to ${tone}`);
  };

  /**
   * Handle Start Therapy button click
   * Initiates therapy session with the currently selected tone
   */
  const handleStartTherapy = async () => {
    console.log(`[App] Starting therapy with tone: ${selectedTone}`);

    // Auto-enter VR mode if not already in it
    if (xrSession.state !== 'immersive') {
      if (!xrSession.isSupported) {
        console.error('[App] WebXR not supported on this device');
        alert('VR mode not supported on this device. Please use a VR headset.');
        return;
      }

      console.log('[App] Auto-entering VR mode for therapy session');
      try {
        await xrSession.startSession();
        console.log('[App] Successfully entered VR mode');
        // Wait a moment for VR to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('[App] Failed to enter VR mode:', error);
        alert('Failed to enter VR mode. Please try the "Enter Spatial Mode" button first.');
        return;
      }
    }

    startTherapy(selectedTone);
    setStatusMessage(`Therapy started with ${selectedTone} tone`);
  };

  const renderSpatialExperience = () => (
    <Canvas
      className="xr-canvas"
      camera={{
        fov: 70,
        position: [0, 1.7, 0]
      }}
      shadows
      gl={{ antialias: true, toneMapping: 2, toneMappingExposure: 1.2 }}
    >
      <Suspense fallback={null}>
        <XR referenceSpace="local-floor">
          {/* Clear sky */}
          <color attach="background" args={['#87CEEB']} />
          <fog attach="fog" args={['#b3d9ff', 30, 100]} />

          {/* Photorealistic sun lighting - bright and natural */}
          <directionalLight
            position={[15, 20, 10]}
            intensity={3.5}
            color="#fff4e6"
            castShadow
            shadow-mapSize={[4096, 4096]}
            shadow-camera-far={100}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
            shadow-bias={-0.0001}
          />

          {/* Sky light - realistic blue sky bounce */}
          <hemisphereLight intensity={1.2} groundColor="#4a3829" color="#87CEEB" />

          {/* Fill light - soft ambient */}
          <ambientLight intensity={0.8} color="#ffeedd" />

          {/* Rim light for depth */}
          <directionalLight position={[-10, 15, -10]} intensity={1.0} color="#a3c4ff" />

          {showDashboard && (
            <SpatialDashboard
              onStartTherapy={handleStartTherapy}
              selectedTone={selectedTone}
              statusMessage={statusMessage}
              therapyActive={therapyActive}
              onExitSession={handleExitSession}
            />
          )}

          <SpatialToneSelector selectedTone={selectedTone} onToneChange={handleToneChange} />

          <ImmersiveRobot visible={showRobotScene} />

          <XRControllerActions selectedTone={selectedTone} onToneChange={handleToneChange} />

          <Controllers />
          <Hands />
        </XR>
      </Suspense>
    </Canvas>
  );

  const renderFallback = () => (
    <div className="fallback-ui">
      <div className="fallback-panels">
        <LeftTonePanel onToneChange={handleToneChange} initialTone={selectedTone} />
        {showDashboard && <CenterDashboard onStartTherapy={handleStartTherapy} />}
      </div>

      {showRobotScene && <Robot3DScene />}
    </div>
  );

  const handleXRButton = () => {
    if (xrSession.state === 'immersive') {
      void xrSession.endSession();
    } else {
      void xrSession.startSession();
    }
  };

  const handleExitSession = () => {
    console.log('[App] Exiting session from UI button');
    exitTherapy();
    void xrSession.endSession();
  };

  const isImmersive = xrSession.state === 'immersive';

  return (
    <div className="app-container">
      <div className={`xr-stage ${isImmersive ? 'xr-stage--active' : 'xr-stage--hidden'}`}>
        {renderSpatialExperience()}
      </div>

      {!isImmersive && renderFallback()}
    </div>
  );
}

/**
 * Main App Component
 * Wraps the app with TherapyStateProvider
 */
function App() {
  return (
    <TherapyStateProvider>
      <AppContent />
    </TherapyStateProvider>
  );
}

export default App;
