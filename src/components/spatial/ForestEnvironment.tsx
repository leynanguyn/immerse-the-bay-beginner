import { useMemo } from 'react';

function PhotorealisticTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Realistic tree trunk */}
      <mesh position={[0, 4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.5, 8, 16]} />
        <meshStandardMaterial
          color="#3d2f1f"
          roughness={0.95}
          metalness={0}
          envMapIntensity={0.3}
        />
      </mesh>

      {/* Photorealistic foliage - fuller, more natural */}
      <mesh position={[0, 9, 0]} castShadow receiveShadow>
        <sphereGeometry args={[3.5, 16, 16]} />
        <meshStandardMaterial
          color="#2d4a1f"
          roughness={0.9}
          envMapIntensity={0.8}
        />
      </mesh>
      <mesh position={[0, 11, 0]} castShadow receiveShadow>
        <sphereGeometry args={[2.8, 16, 16]} />
        <meshStandardMaterial
          color="#3a5c28"
          roughness={0.88}
          envMapIntensity={0.8}
        />
      </mesh>
      <mesh position={[0, 12.5, 0]} castShadow receiveShadow>
        <sphereGeometry args={[2, 16, 16]} />
        <meshStandardMaterial
          color="#4a6c38"
          roughness={0.85}
          envMapIntensity={0.9}
        />
      </mesh>

      {/* Additional foliage clumps for realism */}
      <mesh position={[1.5, 9.5, 0]} castShadow receiveShadow>
        <sphereGeometry args={[1.8, 12, 12]} />
        <meshStandardMaterial color="#35542a" roughness={0.9} envMapIntensity={0.7} />
      </mesh>
      <mesh position={[-1.5, 9.5, 0]} castShadow receiveShadow>
        <sphereGeometry args={[1.8, 12, 12]} />
        <meshStandardMaterial color="#35542a" roughness={0.9} envMapIntensity={0.7} />
      </mesh>
    </group>
  );
}

export default function ForestEnvironment() {
  const treePositions: [number, number, number][] = useMemo(
    () => [
      // Close ring around clearing
      [-6, 0, -4],
      [-4, 0, -6],
      [0, 0, -7],
      [4, 0, -6],
      [6, 0, -4],
      [7, 0, 0],
      [6, 0, 4],
      [4, 0, 6],
      [0, 0, 7],
      [-4, 0, 6],
      [-6, 0, 4],
      [-7, 0, 0],

      // Outer ring for depth
      [-10, 0, -7],
      [-7, 0, -10],
      [0, 0, -12],
      [7, 0, -10],
      [10, 0, -7],
      [12, 0, 0],
      [10, 0, 7],
      [7, 0, 10],
      [0, 0, 12],
      [-7, 0, 10],
      [-10, 0, 7],
      [-12, 0, 0],

      // Fill in some gaps
      [-8, 0, -8],
      [8, 0, -8],
      [8, 0, 8],
      [-8, 0, 8],
    ],
    []
  );

  return (
    <group>
      {treePositions.map((pos, i) => (
        <PhotorealisticTree key={i} position={pos} />
      ))}
    </group>
  );
}
