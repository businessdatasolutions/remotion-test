import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

// Helper function to interpolate between two hex colors
const lerpColor = (color1: string, color2: string, t: number): string => {
  const hex1 = color1.replace("#", "");
  const hex2 = color2.replace("#", "");

  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);

  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

type GhostGlobeProps = {
  position: { x: number; y: number };
  opacity: number;
  fadeOutStart?: number;
  fadeOutDuration?: number;
  scale?: number;
  id: string;
  solidify?: boolean;
  solidifyStart?: number;
  solidifyDuration?: number;
};

export const GhostGlobe: React.FC<GhostGlobeProps> = ({
  position,
  opacity: baseOpacity,
  fadeOutStart,
  fadeOutDuration = 30,
  scale = 1,
  id,
  solidify = false,
  solidifyStart = 0,
  solidifyDuration = 45,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation (fade in over 1 second)
  const entranceOpacity = interpolate(frame, [0, fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Solidify animation - transitions from ghost to solid
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

  // Fade out animation if specified (only if not solidifying)
  let fadeOutOpacity = 1;
  if (fadeOutStart !== undefined && !solidify) {
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

  // When solidifying, opacity goes from baseOpacity to 1
  const targetOpacity = solidify
    ? interpolate(solidifyProgress, [0, 1], [baseOpacity, 1])
    : baseOpacity;
  const finalOpacity = targetOpacity * entranceOpacity * fadeOutOpacity;

  // Colors transition from desaturated to saturated when solidifying
  const ghostLandColor = "#8AAD7C";
  const solidLandColor = "#6B9B59";
  const ghostRimColor = "#5A7A8E";
  const solidRimColor = "#3D5A6E";

  const landColor = solidify
    ? lerpColor(ghostLandColor, solidLandColor, solidifyProgress)
    : ghostLandColor;
  const darkRim = solidify
    ? lerpColor(ghostRimColor, solidRimColor, solidifyProgress)
    : ghostRimColor;

  // Ocean gradient colors (ghost vs solid)
  const oceanColor1 = solidify
    ? lerpColor("#9DCAD9", "#7CB4C9", solidifyProgress)
    : "#9DCAD9";
  const oceanColor2 = solidify
    ? lerpColor("#7AAFC5", "#5A9BB5", solidifyProgress)
    : "#7AAFC5";
  const oceanColor3 = solidify
    ? lerpColor("#6A9AAC", "#4A7A8C", solidifyProgress)
    : "#6A9AAC";

  // Highlight opacity increases when solidifying
  const highlightOpacity = solidify
    ? interpolate(solidifyProgress, [0, 1], [0.3, 0.4])
    : 0.3;

  // Unique IDs for gradients
  const gradientId = `ghost-ocean-gradient-${id}`;
  const highlightId = `ghost-highlight-${id}`;
  const clipId = `ghost-globe-clip-${id}`;

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: finalOpacity,
      }}
    >
      <svg width="400" height="400" viewBox="0 0 200 200">
        <defs>
          {/* Radial gradient for ocean */}
          <radialGradient
            id={gradientId}
            cx="40%"
            cy="35%"
            r="60%"
            fx="30%"
            fy="30%"
          >
            <stop offset="0%" stopColor={oceanColor1} />
            <stop offset="50%" stopColor={oceanColor2} />
            <stop offset="100%" stopColor={oceanColor3} />
          </radialGradient>

          {/* Glossy highlight gradient */}
          <radialGradient
            id={highlightId}
            cx="30%"
            cy="25%"
            r="40%"
          >
            <stop offset="0%" stopColor="white" stopOpacity={highlightOpacity} />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          {/* Clip path for continents */}
          <clipPath id={clipId}>
            <circle cx="100" cy="100" r="88" />
          </clipPath>
        </defs>

        {/* Dark rim/outline */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill={darkRim}
        />

        {/* Main ocean with gradient */}
        <circle
          cx="100"
          cy="100"
          r="88"
          fill={`url(#${gradientId})`}
        />

        {/* Continents group - clipped to globe */}
        <g clipPath={`url(#${clipId})`}>
          {/* Europe */}
          <path
            d="M75 45
               Q80 42 88 44
               Q95 46 98 50
               Q100 55 97 60
               Q92 65 85 68
               Q78 70 72 65
               Q68 58 70 50
               Q72 46 75 45"
            fill={landColor}
          />

          {/* British Isles */}
          <ellipse cx="68" cy="48" rx="5" ry="8" fill={landColor} />

          {/* Scandinavia */}
          <path
            d="M88 30 Q95 28 100 35 Q102 45 95 48 Q88 46 88 38 Q87 32 88 30"
            fill={landColor}
          />

          {/* Africa */}
          <path
            d="M78 72
               Q88 70 95 75
               Q100 82 102 95
               Q103 110 98 125
               Q92 140 82 148
               Q72 152 65 145
               Q60 135 62 120
               Q64 105 68 90
               Q72 78 78 72"
            fill={landColor}
          />

          {/* Madagascar */}
          <ellipse cx="108" cy="135" rx="4" ry="10" fill={landColor} transform="rotate(15 108 135)" />

          {/* Middle East */}
          <path
            d="M105 65
               Q115 60 125 65
               Q130 72 128 82
               Q124 88 115 88
               Q105 85 102 78
               Q102 70 105 65"
            fill={landColor}
          />

          {/* Asia / India */}
          <path
            d="M130 55
               Q145 48 160 52
               Q175 58 180 75
               Q182 90 175 100
               Q165 108 150 105
               Q140 102 135 92
               Q130 80 128 68
               Q128 58 130 55"
            fill={landColor}
          />

          {/* India subcontinent */}
          <path
            d="M138 95
               Q145 92 150 98
               Q152 108 148 118
               Q142 125 135 120
               Q132 112 135 102
               Q136 96 138 95"
            fill={landColor}
          />

          {/* Southeast Asia */}
          <path
            d="M160 100
               Q168 98 175 105
               Q178 115 172 125
               Q165 130 158 125
               Q155 118 157 108
               Q158 102 160 100"
            fill={landColor}
          />

          {/* Indonesia archipelago */}
          <ellipse cx="165" cy="135" rx="8" ry="4" fill={landColor} />
          <ellipse cx="178" cy="138" rx="6" ry="3" fill={landColor} />
          <ellipse cx="188" cy="142" rx="5" ry="3" fill={landColor} />

          {/* Australia */}
          <path
            d="M158 148
               Q175 145 185 155
               Q190 168 182 178
               Q170 185 155 180
               Q145 172 148 160
               Q152 150 158 148"
            fill={landColor}
          />

          {/* New Zealand */}
          <ellipse cx="198" cy="175" rx="3" ry="8" fill={landColor} transform="rotate(-20 198 175)" />
        </g>

        {/* Subtle grid lines */}
        <g clipPath={`url(#${clipId})`} opacity="0.1">
          <ellipse cx="100" cy="55" rx="78" ry="18" fill="none" stroke="#2A4A5A" strokeWidth="0.5" />
          <ellipse cx="100" cy="100" rx="88" ry="25" fill="none" stroke="#2A4A5A" strokeWidth="0.5" />
          <ellipse cx="100" cy="145" rx="78" ry="18" fill="none" stroke="#2A4A5A" strokeWidth="0.5" />
          <ellipse cx="100" cy="100" rx="25" ry="88" fill="none" stroke="#2A4A5A" strokeWidth="0.5" />
          <ellipse cx="100" cy="100" rx="60" ry="88" fill="none" stroke="#2A4A5A" strokeWidth="0.5" />
        </g>

        {/* Glossy highlight overlay */}
        <circle
          cx="100"
          cy="100"
          r="88"
          fill={`url(#${highlightId})`}
        />

        {/* Subtle inner edge highlight */}
        <circle
          cx="100"
          cy="100"
          r="86"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
};
