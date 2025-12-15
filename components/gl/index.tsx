"use client";

import type React from "react";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";

import { Particles } from "./particles";
import { VignetteShader } from "./shaders/vignetteShader";

// ⛔️ NO three/example imports here at the top

const CanvasComponent = dynamic(
  () =>
    Promise.resolve(({ children }: { children: React.ReactNode }) => (
      <Canvas
        camera={{
          position: [1.2629783123314589, 2.664606471394044, -1.8178993743288914],
          fov: 50,
          near: 0.01,
          far: 300,
        }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "#000" }}
      >
        {children}
      </Canvas>
    )),
  { ssr: false }
);

const VignetteEffect = ({ hovering }: { hovering?: boolean }) => {
  const { gl, scene, camera } = useThree();
  const composerRef = useRef<any>(null);
  const shaderPassRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function setupPostprocessing() {
      const [{ EffectComposer }, { RenderPass }, { ShaderPass }] = await Promise.all([
        import("three/examples/jsm/postprocessing/EffectComposer.js"),
        import("three/examples/jsm/postprocessing/RenderPass.js"),
        import("three/examples/jsm/postprocessing/ShaderPass.js"),
      ]);

      if (cancelled) return;

      const composer = new EffectComposer(gl);
      composer.addPass(new RenderPass(scene, camera));

      const shaderPass = new ShaderPass(VignetteShader as any);
      shaderPass.uniforms.darkness.value = 1.5;
      shaderPass.uniforms.offset.value = 0.4;
      composer.addPass(shaderPass);

      composerRef.current = composer;
      shaderPassRef.current = shaderPass;
    }

    setupPostprocessing();

    return () => {
      cancelled = true;
      if (composerRef.current) {
        composerRef.current.dispose();
        composerRef.current = null;
      }
    };
  }, [gl, scene, camera]);

  useFrame(() => {
    if (composerRef.current) {
      composerRef.current.render();
    }
  });

  return null;
};

export const GL = ({ hovering = false }: { hovering?: boolean }) => {
  return (
    <div id="webgl">
      <Suspense fallback={<div className="w-full h-full bg-black" />}>
        <CanvasComponent>
          <Particles
            speed={1.0}
            aperture={1.79}
            focus={3.8}
            size={512}
            noiseScale={0.6}
            noiseIntensity={0.52}
            timeScale={1}
            pointSize={10.0}
            opacity={0.8}
            planeScale={10.0}
            useManualTime={false}
            manualTime={0}
            introspect={hovering}
          />
          <VignetteEffect hovering={hovering} />
        </CanvasComponent>
      </Suspense>
    </div>
  );
};

export default GL;
