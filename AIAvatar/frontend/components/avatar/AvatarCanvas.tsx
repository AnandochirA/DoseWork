'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { useAvatarStore } from '@/lib/state/avatarStore';

interface AvatarModelProps {
  url: string;
}

function AvatarModel({ url }: AvatarModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, group);

  const {
    currentEmotion,
    currentState,
    isSpeaking,
    currentViseme,
    visemeIntensity,
    isBlinking,
    setLoaded
  } = useAvatarStore();

  // Set up morph targets for facial expressions
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
          const mesh = child as THREE.SkinnedMesh;
          if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
            // Enable morph targets
            mesh.frustumCulled = false;
          }
        }
      });
      setLoaded(true);
    }
  }, [scene, setLoaded]);

  // Handle blinking
  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        const mesh = child as THREE.SkinnedMesh;
        if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          const blinkIndex = mesh.morphTargetDictionary['eyesClosed'] ||
                            mesh.morphTargetDictionary['eyeBlink_L'];
          if (blinkIndex !== undefined) {
            mesh.morphTargetInfluences[blinkIndex] = isBlinking ? 1 : 0;
          }
        }
      }
    });
  }, [scene, isBlinking]);

  // Handle viseme for lip sync
  useEffect(() => {
    if (!scene || !isSpeaking) return;

    scene.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        const mesh = child as THREE.SkinnedMesh;
        if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          // Reset all visemes
          Object.keys(mesh.morphTargetDictionary).forEach((key) => {
            if (key.startsWith('viseme_')) {
              const index = mesh.morphTargetDictionary![key];
              mesh.morphTargetInfluences![index] = 0;
            }
          });

          // Set current viseme
          const visemeKey = `viseme_${currentViseme}`;
          const visemeIndex = mesh.morphTargetDictionary[visemeKey];
          if (visemeIndex !== undefined) {
            mesh.morphTargetInfluences[visemeIndex] = visemeIntensity;
          }
        }
      }
    });
  }, [scene, isSpeaking, currentViseme, visemeIntensity]);

  // Handle emotions
  useEffect(() => {
    if (!scene) return;

    const emotionMorphs: Record<string, Record<string, number>> = {
      neutral: {},
      happy: { mouthSmile: 0.5, eyeSquintLeft: 0.3, eyeSquintRight: 0.3 },
      empathetic: { browInnerUp: 0.4, mouthFrownLeft: 0.2, mouthFrownRight: 0.2 },
      encouraging: { mouthSmile: 0.7, eyeWideLeft: 0.2, eyeWideRight: 0.2 },
      celebrating: { mouthSmile: 1, eyeSquintLeft: 0.5, eyeSquintRight: 0.5 },
    };

    const morphs = emotionMorphs[currentEmotion] || {};

    scene.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        const mesh = child as THREE.SkinnedMesh;
        if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          // Reset emotion morphs
          ['mouthSmile', 'browInnerUp', 'mouthFrownLeft', 'mouthFrownRight',
           'eyeSquintLeft', 'eyeSquintRight', 'eyeWideLeft', 'eyeWideRight'].forEach((morphName) => {
            const index = mesh.morphTargetDictionary![morphName];
            if (index !== undefined) {
              mesh.morphTargetInfluences![index] = morphs[morphName] || 0;
            }
          });
        }
      }
    });
  }, [scene, currentEmotion]);

  // Idle animation - subtle breathing
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const idleAction = actions['idle'] || Object.values(actions)[0];
      if (idleAction) {
        idleAction.play();
      }
    }
  }, [actions]);

  return (
    <group ref={group}>
      <primitive object={scene} scale={1.5} position={[0, -1.5, 0]} />
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#0ea5e9" wireframe />
    </mesh>
  );
}

export default function AvatarCanvas() {
  const { modelUrl, cameraPosition } = useAvatarStore();

  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-b from-sky-100 to-sky-200 rounded-2xl overflow-hidden shadow-inner">
      <Canvas
        camera={{
          position: cameraPosition,
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        shadows
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />

        <Suspense fallback={<LoadingFallback />}>
          <AvatarModel url={modelUrl} />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
