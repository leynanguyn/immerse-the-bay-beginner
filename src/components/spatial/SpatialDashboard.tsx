import { useState } from 'react';
import { RoundedBox, Text } from '@react-three/drei';
import { Interactive } from '@react-three/xr';

import type { ToneType } from '../LeftTonePanel';
import { getSpatialPose } from '../../xr/SpatialLayout';

interface SpatialDashboardProps {
  onStartTherapy: () => void;
  selectedTone: ToneType;
  statusMessage?: string;
  therapyActive: boolean;
  onExitSession?: () => void;
}

const dashboardPose = getSpatialPose('dashboard');

export default function SpatialDashboard({
  onStartTherapy,
  selectedTone,
  statusMessage,
  therapyActive,
  onExitSession
}: SpatialDashboardProps) {
  const [hovered, setHovered] = useState(false);
  const [exitHovered, setExitHovered] = useState(false);

  const buttonColor = hovered ? '#6ec1ff' : '#4A90E2';
  const exitButtonColor = exitHovered ? '#ff6b6b' : '#e74c3c';

  return (
    <group position={dashboardPose.position} rotation={dashboardPose.rotation}>
      <RoundedBox args={[1.4, 1.1, 0.05]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color="#0b0f1f" transparent opacity={0.92} />
      </RoundedBox>

      <Text position={[0, 0.2, 0.04]} fontSize={0.1} color="#f5f6ff" anchorX="center" anchorY="middle">
        Therapy Dashboard
      </Text>

      <Text
        position={[0, 0.05, 0.04]}
        fontSize={0.05}
        color="#c5d0ff"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.9}
      >
        Selected tone: {selectedTone}
      </Text>

      <Interactive onSelect={onStartTherapy} onHover={() => setHovered(true)} onBlur={() => setHovered(false)}>
        <mesh position={[0, -0.15, 0.045]}>
          <boxGeometry args={[0.6, 0.15, 0.04]} />
          <meshStandardMaterial color={therapyActive ? '#1f7a4b' : buttonColor} />
          <Text fontSize={0.05} color="#fff" anchorX="center" anchorY="middle">
            {therapyActive ? 'Therapy Active' : 'Start Therapy'}
          </Text>
        </mesh>
      </Interactive>

      {statusMessage && (
        <Text
          position={[0, -0.32, 0.04]}
          fontSize={0.04}
          color="#9fb4ff"
          anchorX="center"
          anchorY="middle"
          maxWidth={1}
        >
          {statusMessage}
        </Text>
      )}

      {onExitSession && (
        <Interactive
          onSelect={onExitSession}
          onHover={() => setExitHovered(true)}
          onBlur={() => setExitHovered(false)}
        >
          <mesh position={[0, -0.42, 0.045]}>
            <boxGeometry args={[0.4, 0.12, 0.04]} />
            <meshStandardMaterial color={exitButtonColor} />
            <Text fontSize={0.045} color="#fff" anchorX="center" anchorY="middle">
              Exit Session
            </Text>
          </mesh>
        </Interactive>
      )}
    </group>
  );
}
