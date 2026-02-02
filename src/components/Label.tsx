import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";

type LabelProps = {
  text: string;
  position: { x: number; y: number };
  style?: "normal" | "highlight" | "subtitle";
  delay?: number;
};

export const Label: React.FC<LabelProps> = ({
  text,
  position,
  style = "normal",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Delayed entrance animation
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(entrance, [0, 1], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Style configurations
  const getStyles = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: position.x,
      top: position.y,
      transform: `translate(-50%, -50%) translateY(${translateY}px)`,
      opacity,
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: "bold",
      textAlign: "center",
      whiteSpace: "nowrap",
    };

    switch (style) {
      case "highlight":
        return {
          ...baseStyle,
          fontSize: 48,
          color: "#2c3e50",
          backgroundColor: "#f1c40f",
          padding: "12px 32px",
          borderRadius: 8,
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
        };
      case "subtitle":
        return {
          ...baseStyle,
          fontSize: 28,
          color: "#7f8c8d",
          fontWeight: "normal",
        };
      default:
        return {
          ...baseStyle,
          fontSize: 36,
          color: "#2c3e50",
        };
    }
  };

  return <div style={getStyles()}>{text}</div>;
};
