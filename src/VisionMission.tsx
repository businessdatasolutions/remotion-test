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

export const VisionMission: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Check if we're in the strategy highlight phase (last 30 frames)
  const isStrategyPhase = frame >= 270;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ecf0f1",
        overflow: "hidden",
      }}
    >
      {/* Scene 1 (0-2s / frames 0-60): Current globe appears with "TODAY" label */}
      <Sequence from={0} durationInFrames={300} premountFor={fps}>
        <Globe variant="current" position="left" />
      </Sequence>

      <Sequence from={0} durationInFrames={300} premountFor={fps}>
        <Label
          text="TODAY"
          position={{ x: 400, y: 800 }}
          style="normal"
          delay={15}
        />
      </Sequence>

      {/* Scene 2 (2-5s / frames 60-150): Animated path emerges */}
      <Sequence from={60} durationInFrames={240} premountFor={fps}>
        <AnimatedPath highlighted={isStrategyPhase} />
      </Sequence>

      {/* Scene 3 (5-7s / frames 150-210): Future globe fades in with VISION label */}
      <Sequence from={150} durationInFrames={150} premountFor={fps}>
        <Globe variant="future" position="right" />
      </Sequence>

      <Sequence from={150} durationInFrames={150} premountFor={fps}>
        <Label
          text="5 YEARS FROM NOW"
          position={{ x: 1520, y: 800 }}
          style="subtitle"
          delay={15}
        />
      </Sequence>

      <Sequence from={165} durationInFrames={135} premountFor={fps}>
        <Label
          text="VISION"
          position={{ x: 1520, y: 880 }}
          style="highlight"
          delay={0}
        />
      </Sequence>

      {/* Scene 4 (7-9s / frames 210-270): Mission point pulses with MISSION label */}
      <Sequence from={210} durationInFrames={90} premountFor={fps}>
        <MissionPoint />
      </Sequence>

      <Sequence from={225} durationInFrames={75} premountFor={fps}>
        <Label
          text="MISSION"
          position={{ x: 1650, y: 420 }}
          style="highlight"
          delay={0}
        />
      </Sequence>

      {/* Pointer line from MISSION label to the point */}
      <Sequence from={225} durationInFrames={75} premountFor={fps}>
        <MissionPointer />
      </Sequence>

      {/* Scene 5 (9-10s / frames 270-300): Strategy label appears */}
      <Sequence from={270} durationInFrames={30} premountFor={fps}>
        <Label
          text="STRATEGY"
          position={{ x: 960, y: 180 }}
          style="highlight"
          delay={0}
        />
      </Sequence>

      {/* Pointer from STRATEGY to the path */}
      <Sequence from={275} durationInFrames={25} premountFor={fps}>
        <StrategyPointer />
      </Sequence>
    </AbsoluteFill>
  );
};

// Helper component for MISSION pointer
const MissionPointer: React.FC = () => {
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
        x1={1590}
        y1={490}
        x2={1640}
        y2={440}
        stroke="#2c3e50"
        strokeWidth={3}
        strokeDasharray={100}
        strokeDashoffset={interpolate(entrance, [0, 1], [100, 0])}
      />
    </svg>
  );
};

// Helper component for STRATEGY pointer
const StrategyPointer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = interpolate(frame, [0, fps * 0.3], [0, 1], {
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
        x1={960}
        y1={210}
        x2={960}
        y2={280}
        stroke="#2c3e50"
        strokeWidth={3}
        strokeDasharray={100}
        strokeDashoffset={interpolate(entrance, [0, 1], [100, 0])}
      />
      <circle
        cx={960}
        cy={290}
        r={6}
        fill="#2c3e50"
        opacity={entrance}
      />
    </svg>
  );
};
