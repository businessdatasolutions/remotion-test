import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { Globe } from "./components/Globe";
import { AnimatedPath } from "./components/AnimatedPath";
import { MissionPoint } from "./components/MissionPoint";
import { Label } from "./components/Label";
import { GhostGlobe } from "./components/GhostGlobe";
import { GhostMissionPoint } from "./components/GhostMissionPoint";
import { ZigzagPath } from "./components/ZigzagPath";

// Target globe position - just above middle of the fan, where path ends
const TARGET_GLOBE_POSITION = { x: 1520, y: 440 };

// Ghost globe configurations - WIDE VERTICAL FAN arrangement
// Spread vertically with the target globe slightly above center
const ghostGlobes = [
  { id: "ghost1", position: { x: 1520, y: 180 }, opacity: 0.3, scale: 0.75 },   // Top
  { id: "ghost2", position: { x: 1520, y: 320 }, opacity: 0.35, scale: 0.82 },  // Upper-mid
  { id: "ghost3", position: TARGET_GLOBE_POSITION, opacity: 0.45, scale: 0.95, isTarget: true }, // Target (above center)
  { id: "ghost4", position: { x: 1520, y: 580 }, opacity: 0.35, scale: 0.82 },  // Lower-mid
  { id: "ghost5", position: { x: 1520, y: 720 }, opacity: 0.3, scale: 0.75 },   // Bottom
  { id: "ghost6", position: { x: 1520, y: 880 }, opacity: 0.25, scale: 0.7 },   // Very bottom
];

// Ghost mission point positions - on each ghost globe
const ghostMissionPoints = [
  { id: "mission1", position: { x: 1590, y: 130 }, opacity: 0.3 },
  { id: "mission2", position: { x: 1590, y: 270 }, opacity: 0.35 },
  { id: "mission3", position: { x: 1590, y: 390 }, opacity: 0.45, isTarget: true }, // Target mission
  { id: "mission4", position: { x: 1590, y: 530 }, opacity: 0.35 },
  { id: "mission5", position: { x: 1590, y: 670 }, opacity: 0.3 },
  { id: "mission6", position: { x: 1590, y: 830 }, opacity: 0.25 },
];

// Zigzag path waypoints - zigzagging toward the target globe
const zigzagWaypoints = [
  { x: 600, y: 540 },             // Start (TODAY globe edge)
  { x: 780, y: 380 },             // First zig (up)
  { x: 960, y: 520 },             // First zag (down)
  { x: 1140, y: 400 },            // Second zig (up)
  { x: TARGET_GLOBE_POSITION.x - 200, y: TARGET_GLOBE_POSITION.y }, // End (approaching target globe)
];

// Frame timings for 25-second video (750 frames @ 30fps)
// Scene 1: 0-75 (0-2.5s) - Starting point (Video 1 state)
// Scene 2: 75-187 (2.5-6.25s) - Reveal uncertainty (ghost globes appear)
// Scene 3: 187-337 (6.25-11.25s) - First step "STAY IN THE GAME"
// Scene 4: 337-487 (11.25-16.25s) - Second step "ADAPT & LEARN"
// Scene 5: 487-600 (16.25-20s) - Third step (second-to-last) - globe & mission solidify
// Scene 6: 600-750 (20-25s) - Final state "EMERGENT STRATEGY"
const STEP_FRAMES = [187, 337, 487, 600]; // When each step begins

// The target globe solidifies on step 3 (second-to-last step)
const SOLIDIFY_FRAME = STEP_FRAMES[2]; // Frame 487

export const AdaptiveStrategy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Determine current step based on frame
  const currentStep =
    frame >= STEP_FRAMES[3] ? 4 :
    frame >= STEP_FRAMES[2] ? 3 :
    frame >= STEP_FRAMES[1] ? 2 :
    frame >= STEP_FRAMES[0] ? 1 : 0;

  // Calculate fade timings for ghost globes based on steps
  // Non-target ghosts fade progressively, target solidifies
  const getGhostFadeStart = (index: number, isTarget: boolean): number | undefined => {
    if (isTarget) return undefined; // Target doesn't fade, it solidifies
    // Outer ghosts fade first, inner ghosts fade later
    if (index === 0 || index === 5) return STEP_FRAMES[0] + 50;  // Top & bottom first
    if (index === 1 || index === 4) return STEP_FRAMES[1] + 50;  // Second layer
    // Index 3 (lower-mid) fades at step 3
    if (index === 3) return STEP_FRAMES[2] + 30;
    return undefined;
  };

  // Original path opacity - fades out when zigzag starts
  const originalPathOpacity = interpolate(
    frame,
    [STEP_FRAMES[0], STEP_FRAMES[0] + 30],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Original mission point fades
  const originalMissionOpacity = interpolate(
    frame,
    [75, 150],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Video 1 labels fade out
  const labelsOpacity = interpolate(
    frame,
    [75, 150],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ecf0f1",
        overflow: "hidden",
      }}
    >
      {/* TODAY globe (always visible) */}
      <Sequence from={0} durationInFrames={750} premountFor={fps}>
        <Globe variant="current" position="left" />
      </Sequence>

      {/* TODAY label (always visible) */}
      <Sequence from={0} durationInFrames={750} premountFor={fps}>
        <Label
          text="TODAY"
          position={{ x: 400, y: 800 }}
          style="normal"
          delay={0}
        />
      </Sequence>

      {/* Scene 1: Original animated path from Video 1 (fades out) */}
      <Sequence from={0} durationInFrames={250} premountFor={fps}>
        <div style={{ opacity: originalPathOpacity }}>
          <AnimatedPath />
        </div>
      </Sequence>

      {/* Scene 1: Original future globe from Video 1 (fades out as ghosts appear) */}
      <Sequence from={0} durationInFrames={187} premountFor={fps}>
        <div style={{ opacity: labelsOpacity }}>
          <Globe variant="future" position="right" />
        </div>
      </Sequence>

      {/* Scene 1: Original labels from Video 1 (fade out) */}
      <Sequence from={0} durationInFrames={187} premountFor={fps}>
        <div style={{ opacity: labelsOpacity }}>
          <Label
            text="5 YEARS FROM NOW"
            position={{ x: 1520, y: 800 }}
            style="subtitle"
            delay={0}
          />
          <Label
            text="VISION"
            position={{ x: 1520, y: 880 }}
            style="highlight"
            delay={0}
          />
        </div>
      </Sequence>

      {/* Scene 1: Original mission point (fades out) */}
      <Sequence from={0} durationInFrames={180} premountFor={fps}>
        <div style={{ opacity: originalMissionOpacity }}>
          <MissionPoint />
        </div>
      </Sequence>

      {/* Scene 2+: Ghost globes in VERTICAL FAN */}
      {ghostGlobes.map((ghost, index) => {
        const isTarget = ghost.isTarget || false;
        return (
          <Sequence key={ghost.id} from={75} durationInFrames={675} premountFor={fps}>
            <GhostGlobe
              id={ghost.id}
              position={ghost.position}
              opacity={ghost.opacity}
              scale={ghost.scale}
              fadeOutStart={getGhostFadeStart(index, isTarget)}
              fadeOutDuration={75}
              solidify={isTarget}
              solidifyStart={SOLIDIFY_FRAME - 75} // Adjusted for sequence start
              solidifyDuration={60}
            />
          </Sequence>
        );
      })}

      {/* Scene 2+: Ghost mission points */}
      {ghostMissionPoints.map((mission, index) => {
        const isTarget = mission.isTarget || false;
        const ghostIndex = index; // Matches ghost globe index
        return (
          <Sequence key={mission.id} from={100} durationInFrames={650} premountFor={fps}>
            <GhostMissionPoint
              position={mission.position}
              opacity={mission.opacity}
              fadeInDuration={50}
              fadeOutStart={isTarget ? undefined : getGhostFadeStart(ghostIndex, false)}
              fadeOutDuration={75}
              solidify={isTarget}
              solidifyStart={SOLIDIFY_FRAME - 100} // Adjusted for sequence start
              solidifyDuration={60}
            />
          </Sequence>
        );
      })}

      {/* Scene 2: Uncertainty text */}
      <Sequence from={75} durationInFrames={112} premountFor={fps}>
        <Label
          text="BUT THE FUTURE IS UNCERTAIN..."
          position={{ x: 960, y: 120 }}
          style="normal"
          delay={10}
        />
      </Sequence>

      {/* Scenes 3-5: Zigzag path */}
      <Sequence from={187} durationInFrames={563} premountFor={fps}>
        <ZigzagPath
          waypoints={zigzagWaypoints}
          currentStep={currentStep}
          stepFrames={STEP_FRAMES.map(f => f - 187)}
        />
      </Sequence>

      {/* Scene 3: "STAY IN THE GAME" text */}
      <Sequence from={187} durationInFrames={150} premountFor={fps}>
        <Label
          text="STAY IN THE GAME"
          position={{ x: 960, y: 120 }}
          style="highlight"
          delay={10}
        />
      </Sequence>

      {/* Scene 4: "ADAPT & LEARN" text */}
      <Sequence from={337} durationInFrames={150} premountFor={fps}>
        <Label
          text="ADAPT & LEARN"
          position={{ x: 960, y: 120 }}
          style="highlight"
          delay={10}
        />
      </Sequence>

      {/* Scene 5: "DISCOVER YOUR MISSION" text - when globe solidifies */}
      <Sequence from={487} durationInFrames={113} premountFor={fps}>
        <Label
          text="DISCOVER YOUR MISSION"
          position={{ x: 960, y: 120 }}
          style="highlight"
          delay={10}
        />
      </Sequence>

      {/* Scene 5: "DISCOVERED MISSION" label - appears after solidification */}
      <Sequence from={550} durationInFrames={200} premountFor={fps}>
        <Label
          text="MISSION"
          position={{ x: 1650, y: 320 }}
          style="highlight"
          delay={15}
        />
      </Sequence>

      {/* Pointer line from label to mission point */}
      <Sequence from={570} durationInFrames={180} premountFor={fps}>
        <MissionPointer targetY={390} />
      </Sequence>

      {/* Scene 6: "EMERGENT STRATEGY" text */}
      <Sequence from={600} durationInFrames={150} premountFor={fps}>
        <Label
          text="EMERGENT STRATEGY"
          position={{ x: 960, y: 120 }}
          style="highlight"
          delay={10}
        />
      </Sequence>

      {/* Scene 6: "TRUE FUTURE" label */}
      <Sequence from={640} durationInFrames={110} premountFor={fps}>
        <Label
          text="TRUE FUTURE"
          position={{ x: 1520, y: 640 }}
          style="normal"
          delay={10}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

// Helper component for MISSION pointer
const MissionPointer: React.FC<{ targetY?: number }> = ({ targetY = 390 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    >
      <line
        x1={1640}
        y1={340}
        x2={1600}
        y2={targetY}
        stroke="#2c3e50"
        strokeWidth={3}
        strokeDasharray={100}
        strokeDashoffset={interpolate(entrance, [0, 1], [100, 0])}
      />
    </svg>
  );
};
