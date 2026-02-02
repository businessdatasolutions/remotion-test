import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";

export const MissionPoint: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation
  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Continuous pulsing animation
  const pulsePhase = (frame / fps) * 2 * Math.PI;
  const pulseScale = 1 + Math.sin(pulsePhase * 2) * 0.15;
  const pulseOpacity = 0.3 + Math.sin(pulsePhase * 2) * 0.2;

  const baseScale = interpolate(entrance, [0, 1], [0, 1]);

  // Position on the future globe (right side)
  // Positioned roughly where Asia/Middle East would be on the globe
  const xPos = 1520 + 70;
  const yPos = 540 - 50;

  return (
    <div
      style={{
        position: "absolute",
        left: xPos,
        top: yPos,
        transform: "translate(-50%, -50%)",
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
          backgroundColor: "#ff6b6b",
          opacity: pulseOpacity * baseScale,
          transform: `translate(-50%, -50%) scale(${pulseScale * baseScale})`,
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
          backgroundColor: "#ff8787",
          opacity: 0.6 * baseScale,
          transform: `translate(-50%, -50%) scale(${baseScale})`,
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
          backgroundColor: "#ff4757",
          boxShadow: "0 0 20px rgba(255, 71, 87, 0.8)",
          transform: `translate(-50%, -50%) scale(${baseScale})`,
        }}
      />

      {/* Center white dot for emphasis */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "white",
          transform: `translate(-50%, -50%) scale(${baseScale})`,
        }}
      />
    </div>
  );
};
