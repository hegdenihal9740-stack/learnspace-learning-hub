import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { createElement, useEffect, useRef, useState } from "react";
import { getRunningPose } from "./roadmapRunnerMotion.js";

function SceneNode({ type, children, ...props }) {
  const sceneProps = { ...props };
  delete sceneProps["data-tsd-source"];
  return createElement(type, sceneProps, children);
}

function CameraTarget() {
  const { camera } = useThree();

  useEffect(() => {
    camera.lookAt(0, 1.5, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

function RunnerHead() {
  return (
    <>
      <SceneNode type="mesh" scale={[0.96, 1.1, 0.9]}>
        <SceneNode type="sphereGeometry" args={[0.24, 32, 24]} />
        <SceneNode type="meshPhysicalMaterial" color="#bd795c" roughness={0.72} clearcoat={0.03} />
      </SceneNode>
      <SceneNode type="mesh" position={[-0.22, -0.015, 0]}>
        <SceneNode type="sphereGeometry" args={[0.055, 20, 16]} />
        <SceneNode type="meshStandardMaterial" color="#b9775a" roughness={0.7} />
      </SceneNode>
      <SceneNode type="mesh" position={[0.22, -0.015, 0]}>
        <SceneNode type="sphereGeometry" args={[0.055, 20, 16]} />
        <SceneNode type="meshStandardMaterial" color="#b9775a" roughness={0.7} />
      </SceneNode>

      <SceneNode type="mesh" position={[0, 0.135, 0.025]} scale={[1, 0.46, 1.02]}>
        <SceneNode type="sphereGeometry" args={[0.235, 32, 20]} />
        <SceneNode type="meshStandardMaterial" color="#30221e" roughness={0.82} />
      </SceneNode>
      <SceneNode type="mesh" position={[0, 0.105, -0.17]} scale={[0.58, 0.26, 0.34]}>
        <SceneNode type="sphereGeometry" args={[0.235, 28, 18]} />
        <SceneNode type="meshStandardMaterial" color="#30221e" roughness={0.8} />
      </SceneNode>
      <SceneNode type="mesh" position={[0.04, 0.16, -0.19]} scale={[0.27, 0.21, 0.28]}>
        <SceneNode type="sphereGeometry" args={[0.11, 24, 16]} />
        <SceneNode type="meshStandardMaterial" color="#3a2924" roughness={0.78} />
      </SceneNode>

      {[-1, 1].map((side) => (
        <SceneNode key={`eye-${side}`} type="group" position={[side * 0.078, 0.026, -0.211]}>
          <SceneNode type="mesh" scale={[0.035, 0.026, 0.016]}>
            <SceneNode type="sphereGeometry" args={[1, 24, 18]} />
            <SceneNode type="meshPhysicalMaterial" color="#f4e9dc" roughness={0.42} />
          </SceneNode>
          <SceneNode type="mesh" position={[0, 0, -0.015]} scale={[0.017, 0.019, 0.009]}>
            <SceneNode type="sphereGeometry" args={[1, 20, 16]} />
            <SceneNode type="meshPhysicalMaterial" color="#704a34" roughness={0.36} />
          </SceneNode>
          <SceneNode type="mesh" position={[0, 0, -0.022]} scale={[0.008, 0.012, 0.006]}>
            <SceneNode type="sphereGeometry" args={[1, 16, 12]} />
            <SceneNode type="meshPhysicalMaterial" color="#211b18" roughness={0.3} />
          </SceneNode>
          <SceneNode type="mesh" position={[-0.004, 0.007, -0.027]} scale={[0.0035, 0.004, 0.003]}>
            <SceneNode type="sphereGeometry" args={[1, 12, 10]} />
            <SceneNode type="meshBasicMaterial" color="#fff" />
          </SceneNode>
        </SceneNode>
      ))}
      {[-1, 1].map((side) => (
        <SceneNode
          key={`brow-${side}`}
          type="mesh"
          position={[side * 0.078, 0.077, -0.207]}
          rotation={[0, 0, side * -0.08]}
        >
          <SceneNode type="capsuleGeometry" args={[0.008, 0.04, 4, 10]} />
          <SceneNode type="meshStandardMaterial" color="#49332a" roughness={0.8} />
        </SceneNode>
      ))}
      <SceneNode type="mesh" position={[0, -0.018, -0.232]} scale={[0.02, 0.038, 0.022]}>
        <SceneNode type="sphereGeometry" args={[1, 20, 16]} />
        <SceneNode type="meshStandardMaterial" color="#b57155" roughness={0.7} />
      </SceneNode>
      <SceneNode type="mesh" position={[0, -0.043, -0.245]} scale={[0.027, 0.019, 0.019]}>
        <SceneNode type="sphereGeometry" args={[1, 20, 16]} />
        <SceneNode type="meshStandardMaterial" color="#bd795c" roughness={0.68} />
      </SceneNode>
      <SceneNode type="mesh" position={[0, -0.102, -0.213]} rotation={[0, 0, Math.PI / 2]}>
        <SceneNode type="capsuleGeometry" args={[0.006, 0.04, 4, 10]} />
        <SceneNode type="meshStandardMaterial" color="#784b40" roughness={0.8} />
      </SceneNode>
    </>
  );
}

function RunnerModel({ running }) {
  const root = useRef(null);
  const torso = useRef(null);
  const head = useRef(null);
  const backpack = useRef(null);
  const leftHip = useRef(null);
  const rightHip = useRef(null);
  const leftKnee = useRef(null);
  const rightKnee = useRef(null);
  const leftShoulder = useRef(null);
  const rightShoulder = useRef(null);
  const leftElbow = useRef(null);
  const rightElbow = useRef(null);
  const elapsed = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener?.("change", updatePreference);
    return () => preference.removeEventListener?.("change", updatePreference);
  }, []);

  useFrame((_, delta) => {
    if (!root.current) return;

    if (!running || reducedMotion) {
      root.current.position.y = 0;
      root.current.rotation.z = 0;
      torso.current.rotation.x = -0.06;
      head.current.rotation.x = 0;
      backpack.current.rotation.z = 0;
      backpack.current.position.y = 0;
      leftHip.current.rotation.x = 0;
      rightHip.current.rotation.x = 0;
      leftKnee.current.rotation.x = 0;
      rightKnee.current.rotation.x = 0;
      leftShoulder.current.rotation.x = 0;
      rightShoulder.current.rotation.x = 0;
      leftElbow.current.rotation.x = 0;
      rightElbow.current.rotation.x = 0;
      return;
    }

    elapsed.current += Math.min(delta, 0.05);
    const pose = getRunningPose(elapsed.current);
    root.current.position.y = pose.bob;
    root.current.rotation.z = pose.bodyRoll;
    torso.current.rotation.x = pose.torsoPitch;
    head.current.rotation.x = pose.headPitch;
    backpack.current.rotation.z = pose.packRoll;
    backpack.current.position.y = pose.packLift;
    leftHip.current.rotation.x = pose.leftHip;
    rightHip.current.rotation.x = pose.rightHip;
    leftKnee.current.rotation.x = pose.leftKnee;
    rightKnee.current.rotation.x = pose.rightKnee;
    leftShoulder.current.rotation.x = pose.leftShoulder;
    rightShoulder.current.rotation.x = pose.rightShoulder;
    leftElbow.current.rotation.x = pose.leftElbow;
    rightElbow.current.rotation.x = pose.rightElbow;
  });

  return (
    <>
      <SceneNode type="mesh" position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <SceneNode type="circleGeometry" args={[0.42, 32]} />
        <SceneNode
          type="meshStandardMaterial"
          color="#071a2c"
          transparent
          opacity={0.32}
          depthWrite={false}
          roughness={1}
        />
      </SceneNode>
      <SceneNode type="group" ref={root} rotation={[0, 2.8, 0]}>
        <SceneNode type="group" ref={leftHip} position={[-0.16, 1.32, 0]}>
          <SceneNode type="mesh" position={[0, -0.32, 0]} castShadow>
            <SceneNode type="capsuleGeometry" args={[0.14, 0.42, 6, 12]} />
            <SceneNode type="meshStandardMaterial" color="#364352" roughness={0.84} />
          </SceneNode>
          <SceneNode type="group" ref={leftKnee} position={[0, -0.64, 0]}>
            <SceneNode type="mesh" position={[0, -0.28, 0]} castShadow>
              <SceneNode type="capsuleGeometry" args={[0.105, 0.36, 6, 12]} />
              <SceneNode type="meshStandardMaterial" color="#465465" roughness={0.84} />
            </SceneNode>
            <SceneNode
              type="mesh"
              position={[0, -0.59, -0.1]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <SceneNode type="capsuleGeometry" args={[0.12, 0.18, 8, 16]} />
              <SceneNode type="meshPhysicalMaterial" color="#eae4da" roughness={0.68} />
            </SceneNode>
            <SceneNode type="mesh" position={[0, -0.68, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
              <SceneNode type="capsuleGeometry" args={[0.122, 0.18, 8, 16]} />
              <SceneNode type="meshStandardMaterial" color="#9d958b" roughness={0.88} />
            </SceneNode>
          </SceneNode>
        </SceneNode>

        <SceneNode type="group" ref={rightHip} position={[0.16, 1.32, 0]}>
          <SceneNode type="mesh" position={[0, -0.32, 0]}>
            <SceneNode type="capsuleGeometry" args={[0.14, 0.42, 6, 12]} />
            <SceneNode type="meshStandardMaterial" color="#364352" roughness={0.84} />
          </SceneNode>
          <SceneNode type="group" ref={rightKnee} position={[0, -0.64, 0]}>
            <SceneNode type="mesh" position={[0, -0.28, 0]}>
              <SceneNode type="capsuleGeometry" args={[0.105, 0.36, 6, 12]} />
              <SceneNode type="meshStandardMaterial" color="#465465" roughness={0.84} />
            </SceneNode>
            <SceneNode
              type="mesh"
              position={[0, -0.59, -0.1]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <SceneNode type="capsuleGeometry" args={[0.12, 0.18, 8, 16]} />
              <SceneNode type="meshPhysicalMaterial" color="#eae4da" roughness={0.68} />
            </SceneNode>
            <SceneNode type="mesh" position={[0, -0.68, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
              <SceneNode type="capsuleGeometry" args={[0.122, 0.18, 8, 16]} />
              <SceneNode type="meshStandardMaterial" color="#9d958b" roughness={0.88} />
            </SceneNode>
          </SceneNode>
        </SceneNode>

        <SceneNode type="group" ref={torso} position={[0, 1.75, 0]}>
          <SceneNode type="mesh" position={[0, 0.02, 0]} castShadow>
            <SceneNode type="capsuleGeometry" args={[0.34, 0.55, 10, 20]} />
            <SceneNode type="meshStandardMaterial" color="#536779" roughness={0.86} />
          </SceneNode>
          <SceneNode type="mesh" position={[0, -0.02, -0.3]} castShadow>
            <SceneNode type="capsuleGeometry" args={[0.135, 0.33, 8, 16]} />
            <SceneNode type="meshStandardMaterial" color="#e7e1d8" roughness={0.86} />
          </SceneNode>
          <SceneNode type="mesh" position={[0, 0.02, -0.44]}>
            <SceneNode type="boxGeometry" args={[0.014, 0.4, 0.014]} />
            <SceneNode type="meshStandardMaterial" color="#b4a99b" roughness={0.86} />
          </SceneNode>

          <SceneNode type="mesh" position={[0, 0.59, 0]}>
            <SceneNode type="capsuleGeometry" args={[0.105, 0.1, 6, 12]} />
            <SceneNode type="meshStandardMaterial" color="#bd795c" roughness={0.72} />
          </SceneNode>
          <SceneNode
            type="group"
            ref={head}
            position={[0, 1, 0]}
            rotation={[0, 0.65, 0]}
            scale={1.08}
          >
            <RunnerHead />
          </SceneNode>

          <SceneNode type="group" ref={backpack} position={[0, 0.02, 0.33]}>
            <SceneNode type="mesh" castShadow>
              <SceneNode type="capsuleGeometry" args={[0.24, 0.19, 8, 16]} />
              <SceneNode type="meshStandardMaterial" color="#73563f" roughness={0.88} />
            </SceneNode>
            <SceneNode type="mesh" position={[0, -0.13, 0.19]}>
              <SceneNode type="capsuleGeometry" args={[0.16, 0.055, 6, 12]} />
              <SceneNode type="meshStandardMaterial" color="#8a6a4c" roughness={0.88} />
            </SceneNode>
            <SceneNode type="mesh" position={[0, -0.13, 0.27]}>
              <SceneNode type="boxGeometry" args={[0.012, 0.25, 0.01]} />
              <SceneNode type="meshStandardMaterial" color="#c3a987" roughness={0.82} />
            </SceneNode>
          </SceneNode>

          <SceneNode type="group" ref={leftShoulder} position={[-0.37, 0.38, 0]}>
            <SceneNode type="mesh" position={[0, -0.24, 0]} castShadow>
              <SceneNode type="capsuleGeometry" args={[0.11, 0.3, 6, 12]} />
              <SceneNode type="meshStandardMaterial" color="#536779" roughness={0.86} />
            </SceneNode>
            <SceneNode type="group" ref={leftElbow} position={[0, -0.48, 0]}>
              <SceneNode type="mesh" position={[0, -0.21, 0]}>
                <SceneNode type="capsuleGeometry" args={[0.09, 0.27, 6, 12]} />
                <SceneNode type="meshStandardMaterial" color="#62788b" roughness={0.86} />
              </SceneNode>
              <SceneNode type="mesh" position={[0, -0.42, 0]}>
                <SceneNode type="sphereGeometry" args={[0.09, 16, 12]} />
                <SceneNode type="meshPhysicalMaterial" color="#bd795c" roughness={0.72} />
              </SceneNode>
            </SceneNode>
          </SceneNode>

          <SceneNode type="group" ref={rightShoulder} position={[0.37, 0.38, 0]}>
            <SceneNode type="mesh" position={[0, -0.24, 0]} castShadow>
              <SceneNode type="capsuleGeometry" args={[0.11, 0.3, 6, 12]} />
              <SceneNode type="meshStandardMaterial" color="#536779" roughness={0.86} />
            </SceneNode>
            <SceneNode type="group" ref={rightElbow} position={[0, -0.48, 0]}>
              <SceneNode type="mesh" position={[0, -0.21, 0]}>
                <SceneNode type="capsuleGeometry" args={[0.09, 0.27, 6, 12]} />
                <SceneNode type="meshStandardMaterial" color="#62788b" roughness={0.86} />
              </SceneNode>
              <SceneNode type="mesh" position={[0, -0.42, 0]}>
                <SceneNode type="sphereGeometry" args={[0.09, 16, 12]} />
                <SceneNode type="meshPhysicalMaterial" color="#bd795c" roughness={0.72} />
              </SceneNode>
            </SceneNode>
          </SceneNode>
        </SceneNode>
      </SceneNode>
    </>
  );
}

export default function RoadmapRunner3D({ running, active }) {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [2.2, 2.65, 7.6], fov: 28, near: 0.1, far: 30 }}
      dpr={[1, 2]}
      frameloop={active ? "always" : "demand"}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      shadows
      style={{ position: "absolute", inset: 0, background: "transparent" }}
    >
      <CameraTarget />
      <SceneNode type="ambientLight" intensity={0.8} />
      <SceneNode type="hemisphereLight" args={["#f3f8ff", "#33445b", 1.35]} />
      <SceneNode
        type="directionalLight"
        position={[-3, 5, 4]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      <SceneNode
        type="pointLight"
        position={[1.5, 1.8, 2.5]}
        color="#f4d8c0"
        intensity={0.55}
        distance={6}
      />
      <RunnerModel running={running} />
    </Canvas>
  );
}
