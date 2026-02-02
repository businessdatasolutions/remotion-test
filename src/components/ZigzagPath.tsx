import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

type Waypoint = {
  x: number;
  y: number;
  label?: string;
};

type ZigzagPathProps = {
  waypoints: Waypoint[];
  currentStep: number;
  stepFrames: number[];
};

export const ZigzagPath: React.FC<ZigzagPathProps> = ({
  waypoints,
  currentStep,
  stepFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Generate path segments between waypoints
  const segments: { from: Waypoint; to: Waypoint; stepIndex: number }[] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    segments.push({
      from: waypoints[i],
      to: waypoints[i + 1],
      stepIndex: i,
    });
  }

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
      {/* Draw path segments */}
      {segments.map((segment, index) => {
        const segmentStartFrame = stepFrames[index] || 0;
        const segmentFrame = frame - segmentStartFrame;

        // Only show segment if we've reached its step
        if (frame < segmentStartFrame) {
          return null;
        }

        // Draw animation for this segment
        const drawProgress = spring({
          frame: segmentFrame,
          fps,
          config: { damping: 200 },
          durationInFrames: 60,
        });

        // Calculate control points for a smooth curve
        // Zigzag alternates direction - even segments curve up, odd curve down
        const midX = (segment.from.x + segment.to.x) / 2;
        const midY = (segment.from.y + segment.to.y) / 2;
        const curveOffset = index % 2 === 0 ? -80 : 80;

        const pathD = `M ${segment.from.x} ${segment.from.y}
                       Q ${midX} ${midY + curveOffset}, ${segment.to.x} ${segment.to.y}`;

        const pathLength = 400;
        const dashOffset = interpolate(drawProgress, [0, 1], [pathLength, 0]);

        // Color transitions: blue while drawing, orange when complete
        const isComplete = index < currentStep;
        const strokeColor = isComplete ? "#ff9f43" : "#3498db";
        const strokeWidth = isComplete ? 6 : 5;

        return (
          <path
            key={`segment-${index}`}
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={pathLength}
            strokeDashoffset={dashOffset}
          />
        );
      })}

      {/* Waypoint markers */}
      {waypoints.map((point, index) => {
        // First waypoint is always visible (start)
        const waypointStepFrame = index === 0 ? 0 : stepFrames[index - 1] + 50;

        if (frame < waypointStepFrame) {
          return null;
        }

        const waypointFrame = frame - waypointStepFrame;

        const waypointEntrance = spring({
          frame: waypointFrame,
          fps,
          config: { damping: 15, stiffness: 100 },
        });

        const scale = interpolate(waypointEntrance, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        // Pulsing animation for current waypoint
        const isActive = index === currentStep;
        const pulsePhase = (frame / fps) * 2 * Math.PI;
        const pulseScale = isActive ? 1 + Math.sin(pulsePhase * 2) * 0.1 : 1;

        // Color based on progress
        const isPassed = index < currentStep;
        const isLast = index === waypoints.length - 1;
        const fillColor = isPassed ? "#ff9f43" : isLast && isActive ? "#27ae60" : "#3498db";

        return (
          <g key={`waypoint-${index}`} transform={`translate(${point.x}, ${point.y})`}>
            {/* Outer glow for active waypoint */}
            {isActive && (
              <circle
                r={20 * scale * pulseScale}
                fill={`${fillColor}40`}
                opacity={0.5 + Math.sin(pulsePhase * 2) * 0.2}
              />
            )}
            {/* Direction indicator - small arrow showing course correction */}
            {index > 0 && index < waypoints.length - 1 && isPassed && (
              <g opacity={scale}>
                <path
                  d="M -8 -4 L 0 0 L -8 4"
                  fill="none"
                  stroke="#ff9f43"
                  strokeWidth={2}
                  strokeLinecap="round"
                  transform={`rotate(${index % 2 === 0 ? -45 : 45})`}
                />
              </g>
            )}
            {/* Main waypoint circle */}
            <circle
              r={isLast ? 14 : 12}
              fill={fillColor}
              stroke="white"
              strokeWidth={3}
              transform={`scale(${scale})`}
            />
            {/* Inner white dot */}
            <circle
              r={4}
              fill="white"
              transform={`scale(${scale})`}
            />
          </g>
        );
      })}

      {/* Arrow head at the final destination */}
      {frame >= stepFrames[stepFrames.length - 1] + 50 && (
        <g
          transform={`translate(${waypoints[waypoints.length - 1].x}, ${waypoints[waypoints.length - 1].y}) rotate(45)`}
          opacity={interpolate(
            frame - stepFrames[stepFrames.length - 1] - 50,
            [0, 20],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )}
        >
          <polygon
            points="0,-15 25,0 0,15"
            fill="#27ae60"
          />
        </g>
      )}
    </svg>
  );
};
