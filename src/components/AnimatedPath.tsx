import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";

type AnimatedPathProps = {
  highlighted?: boolean;
};

export const AnimatedPath: React.FC<AnimatedPathProps> = ({
  highlighted = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Path draw animation (takes about 3 seconds = 90 frames)
  const drawProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 90,
  });

  // Total path length (approximate for this curve)
  const pathLength = 1200;
  const dashOffset = interpolate(drawProgress, [0, 1], [pathLength, 0]);

  // Highlight animation when STRATEGY label appears
  const highlightOpacity = highlighted ? 1 : 0.8;
  const strokeColor = highlighted ? "#ff9f43" : "#3498db";
  const strokeWidth = highlighted ? 8 : 5;

  return (
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      {/* Curved path from left globe to right globe */}
      <path
        d="M 600 540
           C 750 300, 1000 200, 1100 300
           C 1200 400, 1250 500, 1320 540"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={dashOffset}
        opacity={highlightOpacity}
      />

      {/* Animated dots along the path for visual interest */}
      {[0.2, 0.4, 0.6, 0.8].map((t, i) => {
        const dotProgress = spring({
          frame: frame - i * 10,
          fps,
          config: { damping: 200 },
        });

        const dotOpacity = interpolate(
          drawProgress,
          [t - 0.1, t, t + 0.1],
          [0, 1, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        // Calculate position along bezier curve (approximation)
        const positions = [
          { x: 700, y: 420 },
          { x: 900, y: 280 },
          { x: 1100, y: 340 },
          { x: 1250, y: 480 },
        ];

        return (
          <circle
            key={i}
            cx={positions[i].x}
            cy={positions[i].y}
            r={8}
            fill="#3498db"
            opacity={dotOpacity * dotProgress}
          />
        );
      })}

      {/* Arrow head at the end */}
      <g
        transform="translate(1320, 540) rotate(20)"
        opacity={interpolate(drawProgress, [0.9, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
      >
        <polygon
          points="0,-15 25,0 0,15"
          fill={strokeColor}
        />
      </g>
    </svg>
  );
};
