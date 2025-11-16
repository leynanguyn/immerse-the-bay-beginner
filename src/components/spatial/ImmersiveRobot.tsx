import { Suspense, useMemo, useRef } from 'react';
import { Environment, useGLTF, useTexture } from '@react-three/drei';
import { BackSide, EquirectangularReflectionMapping } from 'three';
import type { Group } from 'three';

import { getSpatialPose } from '../../xr/SpatialLayout';
import { useSpatialAudioAnchor } from '../../xr/spatialAudio';

const robotPose = getSpatialPose('robot');
const ROBOT_MODEL_PATH = '/models/robot.glb';

interface ImmersiveRobotProps {
  visible: boolean;
}

function RobotModel() {
  const gltf = useGLTF(ROBOT_MODEL_PATH) as { scene: Group };

  const robotScene = useMemo(() => {
    return gltf?.scene ? gltf.scene.clone() : null;
  }, [gltf]);

  if (!robotScene) return null;

  return <primitive object={robotScene} />;
}

function CoffeeShopRoom() {
  // Load the photorealistic coffee shop HDRI (JPG version for performance)
  const texture = useTexture('https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/comfy_cafe.jpg');

  // Set up equirectangular mapping for 360 environment
  texture.mapping = EquirectangularReflectionMapping;

  return (
    <>
      {/* 360 degree photorealistic coffee shop background */}
      <mesh>
        <sphereGeometry args={[50, 60, 40]} />
        <meshBasicMaterial map={texture} side={BackSide} />
      </mesh>

      {/* Simple floor for robot to sit on */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color="#8B7355"
          roughness={0.9}
          metalness={0.1}
          transparent
          opacity={0.3}
        />
      </mesh>
    </>
  );
}

export default function ImmersiveRobot({ visible }: ImmersiveRobotProps) {
  const groupRef = useRef<Group | null>(null);

  useSpatialAudioAnchor(groupRef, { refDistance: 2.2 });

  if (!visible) {
    return null;
  }

  return (
    <group ref={groupRef} position={robotPose.position} rotation={robotPose.rotation} scale={robotPose.scale}>
      <Suspense fallback={null}>
        <RobotModel />
        <CoffeeShopRoom />
      </Suspense>

      <Environment preset="apartment" />
    </group>
  );
}

useGLTF.preload(ROBOT_MODEL_PATH);
