"use client";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { BackSide, Mesh, TextureLoader } from "three";

function Panorama({ url }: { url: string }) {
  const texture = useLoader(TextureLoader, url)
  const sphereRef = useRef<Mesh>(null)

  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={BackSide} />
    </mesh>
  )
}

export const GameComponent = () => {
    return (
        <Canvas camera={{ position: [0, 0, 0], fov: 75 }}>
            <Suspense fallback={null}>
                <Panorama url="/images/sky.jpg" />
            </Suspense>
        </Canvas>
    )
}