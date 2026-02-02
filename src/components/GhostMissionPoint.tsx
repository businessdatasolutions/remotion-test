import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

type GhostMissionPointProps = {
  position: { x: number; y: number };
  opacity: number;
  fadeOutStart?: number;
  fadeOutDuration?: number;
  fadeInDuration?: number;
  solidify?: boolean;
  solidifyStart?: number;
  solidifyDuration?: number;
};

export const GhostMissionPoint: React.FC<GhostMissionPointProps> = ({
  position,
  opacity: baseOpacity,
  fadeOutStart,
  fadeOutDuration = 30,
  fadeInDuration = 30,
  solidify = false,
  solidifyStart = 0,
  solidifyDuration = 30,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance fade in
  const entranceOpacity = interpolate(frame, [0, fadeInDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out animation if specified
  let fadeOutOpacity = 1;
  if (fadeOutStart !== undefined) {
    fadeOutOpacity = interpolate(
      frame,
      [fadeOutStart, fadeOutStart + fadeOutDuration],
      [1, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );
  }

  // Solidify animation - makes the point go from ghost to solid
  let solidifyProgress = 0;
  if (solidify) {
    solidifyProgress = interpolate(
      frame,
      [solidifyStart, solidifyStart + solidifyDuration],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );
  }

  // Base opacity combines with solidify for final opacity
  const targetOpacity = solidify ? interpolate(solidifyProgress, [0, 1], [baseOpacity, 1]) : baseOpacity;
  const finalOpacity = targetOpacity * entranceOpacity * fadeOutOpacity;

  // Reduced pulsing for ghost version, stronger for solidified
  const pulsePhase = (frame / fps) * 2 * Math.PI;
  const pulseIntensity = interpolate(solidifyProgress, [0, 1], [0.05, 0.15]);
  const pulseScale = 1 + Math.sin(pulsePhase * 2) * pulseIntensity;
  const pulseOpacity = interpolate(solidifyProgress, [0, 1], [0.15, 0.3]) + Math.sin(pulsePhase * 2) * 0.1;

  // Colors become more saturated when solidifying
  const outerColor = `rgba(255, ${interpolate(solidifyProgress, [0, 1], [150, 107])}, ${interpolate(solidifyProgress, [0, 1], [150, 107])}, 1)`;
  const middleColor = `rgba(255, ${interpolate(solidifyProgress, [0, 1], [170, 135])}, ${interpolate(solidifyProgress, [0, 1], [170, 135])}, 1)`;
  const innerColor = `rgba(255, ${interpolate(solidifyProgress, [0, 1], [130, 71])}, ${interpolate(solidifyProgress, [0, 1], [130, 87])}, 1)`;

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
        opacity: finalOpacity,
      }}
    >
      {/* Outer pulsing ring */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 80,
          height: 80,
          borderRadius: "50%",
          backgroundColor: outerColor,
          opacity: pulseOpacity,
          transform: `translate(-50%, -50%) scale(${pulseScale})`,
        }}
      />

      {/* Middle ring */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 50,
          height: 50,
          borderRadius: "50%",
          backgroundColor: middleColor,
          opacity: 0.5,
          transform: `translate(-50%, -50%)`,
        }}
      />

      {/* Inner solid point */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor: innerColor,
          boxShadow: solidify && solidifyProgress > 0.5
            ? "0 0 20px rgba(255, 71, 87, 0.8)"
            : "0 0 10px rgba(255, 100, 100, 0.4)",
          transform: `translate(-50%, -50%)`,
        }}
      />

      {/* Center white dot */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "white",
          opacity: interpolate(solidifyProgress, [0, 1], [0.6, 1]),
          transform: `translate(-50%, -50%)`,
        }}
      />
    </div>
  );
};
