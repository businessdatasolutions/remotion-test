import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

type Branch = {
  id: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  controlPoint1: { x: number; y: number };
  controlPoint2: { x: number; y: number };
  isChosen: boolean;
  appearsAtStep: number;
};

type BranchingPathProps = {
  branches: Branch[];
  currentStep: number;
  stepFrames: number[];
};

export const BranchingPath: React.FC<BranchingPathProps> = ({
  branches,
  currentStep,
  stepFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate waypoints for branch points
  const waypoints = [
    { x: 800, y: 400 },   // First branch point
    { x: 1000, y: 350 },  // Second branch point
    { x: 1320, y: 540 },  // End point (future globe)
  ];

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
      {branches.map((branch) => {
        const branchStepFrame = stepFrames[branch.appearsAtStep - 1] || 0;
        const branchFrame = frame - branchStepFrame;

        // Draw animation
        const drawProgress = spring({
          frame: branchFrame,
          fps,
          config: { damping: 200 },
          durationInFrames: 60,
        });

        // Path for this branch
        const pathD = `M ${branch.startPoint.x} ${branch.startPoint.y}
                       C ${branch.controlPoint1.x} ${branch.controlPoint1.y},
                         ${branch.controlPoint2.x} ${branch.controlPoint2.y},
                         ${branch.endPoint.x} ${branch.endPoint.y}`;

        const pathLength = 600;
        const dashOffset = interpolate(drawProgress, [0, 1], [pathLength, 0]);

        // Opacity based on whether branch is chosen and current step
        let opacity = 1;
        let strokeColor = "#3498db";
        let strokeWidth = 5;

        if (!branch.isChosen) {
          // Unchosen branches fade out after being revealed
          const fadeDelay = 30;
          opacity = interpolate(
            branchFrame,
            [fadeDelay, fadeDelay + 45],
            [0.8, 0.2],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          strokeColor = "#95a5a6";
          strokeWidth = 3;
        } else if (currentStep > branch.appearsAtStep) {
          // Chosen path turns orange once we've moved past it
          strokeColor = "#ff9f43";
          strokeWidth = 6;
        }

        // Only show if we've reached the step where this branch appears
        if (frame < branchStepFrame) {
          return null;
        }

        return (
          <path
            key={branch.id}
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={pathLength}
            strokeDashoffset={dashOffset}
            opacity={opacity}
          />
        );
      })}

      {/* Waypoint markers at branch points */}
      {waypoints.map((point, index) => {
        const waypointStepFrame = stepFrames[index] || 0;
        const waypointFrame = frame - waypointStepFrame;

        // Only show waypoint if we've reached the step
        if (frame < waypointStepFrame + 30) {
          return null;
        }

        const waypointEntrance = spring({
          frame: waypointFrame - 30,
          fps,
          config: { damping: 15, stiffness: 100 },
        });

        const scale = interpolate(waypointEntrance, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        // Pulsing animation for active waypoint
        const isActive = currentStep === index + 1;
        const pulsePhase = (frame / fps) * 2 * Math.PI;
        const pulseScale = isActive ? 1 + Math.sin(pulsePhase * 2) * 0.1 : 1;

        return (
          <g key={`waypoint-${index}`} transform={`translate(${point.x}, ${point.y})`}>
            {/* Outer glow for active waypoint */}
            {isActive && (
              <circle
                r={20 * scale * pulseScale}
                fill="rgba(52, 152, 219, 0.3)"
                opacity={0.5 + Math.sin(pulsePhase * 2) * 0.2}
              />
            )}
            {/* Main waypoint circle */}
            <circle
              r={12 * scale}
              fill={index < currentStep ? "#ff9f43" : "#3498db"}
              stroke="white"
              strokeWidth={3}
            />
            {/* Inner white dot */}
            <circle
              r={4 * scale}
              fill="white"
            />
          </g>
        );
      })}

      {/* Arrow head at the final destination (only when path reaches there) */}
      {frame >= stepFrames[2] + 50 && (
        <g
          transform="translate(1320, 540) rotate(45)"
          opacity={interpolate(
            frame - stepFrames[2] - 50,
            [0, 20],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )}
        >
          <polygon
            points="0,-15 25,0 0,15"
            fill="#ff9f43"
          />
        </g>
      )}
    </svg>
  );
};
