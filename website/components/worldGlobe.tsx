"use client";
import React, { useEffect, useRef } from "react";

const labels = [
  { angle: 0, label: "SPARK", baseColor: "rgba(255, 89, 94, 0.9)", icon: "🧠" },
  { angle: 90, label: "WAVE", baseColor: "rgba(25, 130, 196, 0.9)", icon: "🌊" },
  { angle: 180, label: "RSD METER", baseColor: "rgba(106, 76, 147, 0.9)", icon: "💜" },
  { angle: 270, label: "POPCORN", baseColor: "rgba(255, 215, 0, 0.9)", icon: "🍿" },
];

const worldLocations = [
  { lat: 40, lon: -74, name: "New York" },
  { lat: 51, lon: 0, name: "London" },
  { lat: 35, lon: 139, name: "Tokyo" },
  { lat: -33, lon: 151, name: "Sydney" },
  { lat: 19, lon: 72, name: "Mumbai" },
  { lat: -23, lon: -46, name: "São Paulo" },
  { lat: 1, lon: 103, name: "Singapore" },
  { lat: 52, lon: 13, name: "Berlin" },
  { lat: 45, lon: -73, name: "Montreal" },
  { lat: -26, lon: 28, name: "Johannesburg" },
];

const WorldGlobe: React.FC<{ size?: number; radius?: number }> = ({
  size = 400,
  radius = 140,
}) => {
  const requestRef = useRef<number>(0);
  const center = size / 2;
  const [isPaused, setIsPaused] = React.useState(false);
  const [rotation, setRotation] = React.useState(0);
  const [hoveredLabel, setHoveredLabel] = React.useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = React.useState<string | null>(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, rotation: 0 });
  const tiltAngle = 20;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, rotation });
    setIsPaused(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const newRotation = (dragStart.rotation + deltaX * 0.5) % 360;
      setRotation(newRotation);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPaused(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsPaused(false);
  };

  useEffect(() => {
    if (!isPaused) {
      const animate = () => {
        setRotation((prev) => (prev + 0.2) % 360);
        requestRef.current = requestAnimationFrame(animate);
      };
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPaused]);

  const getLabelPos = (angle: number) => {
    const rad = ((angle + rotation) * Math.PI) / 180;
    const offset = radius + 40;
    const x = center + Math.sin(rad) * offset;
    const y = center - Math.cos(rad) * offset * Math.cos((tiltAngle * Math.PI) / 180);
    const z = Math.cos(rad);
    return { x, y, z };
  };

  const latLonTo3D = (lat: number, lon: number, time: number) => {
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((lon + time * 20) * Math.PI) / 180; // Rotate with time
    
    const x = center + radius * 0.9 * Math.sin(phi) * Math.cos(theta);
    const y = center - radius * 0.9 * Math.cos(phi) * Math.cos((tiltAngle * Math.PI) / 180);
    const z = Math.sin(phi) * Math.sin(theta);
    
    return { x, y, z, visible: z > -0.3 }; // Only show front half
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "radial-gradient(ellipse at center, rgba(30, 50, 90, 0.95), rgba(10, 15, 30, 1))",
        borderRadius: "40px",
        boxShadow: "0 20px 60px rgba(44, 172, 136, 0.4), 0 0 80px rgba(25, 130, 196, 0.2)",
        position: "relative",
        overflow: "hidden",
        perspective: "1200px",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.02); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 8px currentColor); }
          50% { filter: drop-shadow(0 0 20px currentColor); }
        }
        @keyframes particle-float {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)); opacity: 0; }
        }
        .label-group:hover .label-rect {
          transform: scale(1.2);
          opacity: 1;
          filter: drop-shadow(0 0 25px currentColor) drop-shadow(0 10px 20px rgba(0,0,0,0.4));
        }
        .label-group:hover .label-text, .label-group:hover .label-icon {
          transform: scale(1.2);
          filter: drop-shadow(0 0 12px rgba(255, 255, 255, 1));
        }
        .label-group.selected .label-rect {
          transform: scale(1.25);
          filter: drop-shadow(0 0 30px currentColor) drop-shadow(0 12px 24px rgba(0,0,0,0.5));
        }
        .location-marker {
          animation: glow-pulse 2s ease-in-out infinite;
          cursor: pointer;
        }
        .location-marker:hover {
          filter: drop-shadow(0 0 12px #2FAC88) !important;
        }
        .connection-line {
          stroke-dasharray: 200;
          animation: dash 3s linear infinite;
        }
        @keyframes dash {
          to { stroke-dashoffset: -400; }
        }
      `}</style>
      
      <svg
        width={size}
        height={size}
        style={{ position: "absolute", opacity: 0.4 }}
      >
        {Array.from({ length: 50 }).map((_, i) => {
          const starSize = Math.random() * 2.5 + 0.5;
          return (
            <circle
              key={i}
              cx={Math.random() * size}
              cy={Math.random() * size}
              r={starSize}
              fill="#fff"
              opacity={Math.random() * 0.5 + 0.5}
            >
              <animate
                attributeName="opacity"
                values={`${Math.random() * 0.3 + 0.3};${Math.random() * 0.8 + 0.2};${Math.random() * 0.3 + 0.3}`}
                dur={`${Math.random() * 3 + 2}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}
      </svg>

      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={`particle-${i}`}
          style={{
            position: "absolute",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: `hsl(${180 + Math.random() * 60}, 70%, 60%)`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0,
            animation: `particle-float ${5 + Math.random() * 5}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            // @ts-ignore
            "--tx": `${(Math.random() - 0.5) * 100}px`,
            "--ty": `${(Math.random() - 0.5) * 100}px`,
            boxShadow: "0 0 10px currentColor",
          }}
        />
      ))}

      <svg width={size} height={size} style={{ width: size, height: size, position: "relative", zIndex: 1 }}>
        <defs>
          <radialGradient id="globeGradient" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#B8E8DC">
              <animate
                attributeName="stop-color"
                values="#B8E8DC;#A8D8EA;#88C8D8;#B8E8DC"
                dur="8s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="40%" stopColor="#2FAC88" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#1B7A66" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0A4A3A" stopOpacity="0.9">
              <animate
                attributeName="stop-color"
                values="#0A4A3A;#1A5A4A;#0A3A2A;#0A4A3A"
                dur="8s"
                repeatCount="indefinite"
              />
            </stop>
          </radialGradient>
          
          <radialGradient id="highlight" cx="35%" cy="35%" r="40%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="shadow" cx="65%" cy="65%" r="40%">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
          </radialGradient>

          <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2FAC88" stopOpacity="0.1" />
          </radialGradient>

          {labels.map((_, idx) => (
            <linearGradient key={idx} id={`labelGrad-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={labels[idx].baseColor}>
                <animate
                  attributeName="stop-color"
                  values="rgba(255, 89, 94, 0.95);rgba(25, 130, 196, 0.95);rgba(106, 76, 147, 0.95);rgba(255, 215, 0, 0.95);rgba(255, 89, 94, 0.95)"
                  dur="12s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor={labels[idx].baseColor.replace("0.9", "0.7")}>
                <animate
                  attributeName="stop-color"
                  values="rgba(255, 89, 94, 0.7);rgba(25, 130, 196, 0.7);rgba(106, 76, 147, 0.7);rgba(255, 215, 0, 0.7);rgba(255, 89, 94, 0.7)"
                  dur="12s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
          ))}

          <filter id="globeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.3" />
          </filter>

          <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.3)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        <g style={{ animation: "pulse 6s ease-in-out infinite" }}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="url(#globeGradient)"
            stroke="#6DBAA8"
            strokeWidth="3"
            filter="url(#globeGlow)"
          />
          
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="url(#shadow)"
            opacity="0.5"
          />
          
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="url(#highlight)"
          />
          
          <circle
            cx={center}
            cy={center}
            r={radius * 0.9}
            fill="url(#innerGlow)"
            opacity="0.4"
          />

          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#shimmer)"
            strokeWidth="2"
            opacity="0.6"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 200 200"
              to="360 200 200"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {worldLocations.map((loc, idx) => {
          const pos = latLonTo3D(loc.lat, loc.lon, rotation / 20);
          if (!pos.visible) return null;
          
          const scale = 0.5 + 0.5 * (pos.z + 1);
          const opacity = 0.4 + 0.6 * (pos.z + 1);
          
          return (
            <g key={`loc-${idx}`} opacity={opacity}>
              <circle
                className="location-marker"
                cx={pos.x}
                cy={pos.y}
                r={3 * scale}
                fill="#2FAC88"
                style={{ filter: `drop-shadow(0 0 6px #2FAC88)` }}
                onMouseEnter={() => setHoveredLabel(loc.name)}
                onMouseLeave={() => setHoveredLabel(null)}
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={8 * scale}
                fill="none"
                stroke="#2FAC88"
                strokeWidth="1"
                opacity="0.4"
              >
                <animate
                  attributeName="r"
                  values={`${6 * scale};${12 * scale};${6 * scale}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.6;0.1;0.6"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              {hoveredLabel === loc.name && (
                <g>
                  <rect
                    x={pos.x - 35}
                    y={pos.y - 35}
                    width={70}
                    height={25}
                    rx={6}
                    fill="rgba(47, 172, 136, 0.95)"
                    filter="url(#shadow)"
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 22}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontFamily="Inter, sans-serif"
                    fontWeight="600"
                    fontSize="0.75rem"
                    fill="#fff"
                  >
                    {loc.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        <ellipse
          cx={center}
          cy={center}
          rx={radius + 35}
          ry={(radius + 35) * Math.cos((tiltAngle * Math.PI) / 180)}
          fill="none"
          stroke="#6DBAA8"
          strokeWidth="2"
          strokeOpacity="0.3"
          strokeDasharray="8,8"
        >
          <animate
            attributeName="stroke-opacity"
            values="0.2;0.5;0.2"
            dur="4s"
            repeatCount="indefinite"
          />
        </ellipse>

        <ellipse
          cx={center}
          cy={center}
          rx={radius + 50}
          ry={(radius + 50) * Math.cos((tiltAngle * Math.PI) / 180)}
          fill="none"
          stroke="#1982c4"
          strokeWidth="1.5"
          strokeOpacity="0.2"
          strokeDasharray="5,10"
        >
          <animate
            attributeName="stroke-opacity"
            values="0.1;0.4;0.1"
            dur="5s"
            repeatCount="indefinite"
          />
        </ellipse>

        {labels.map(({ angle, label, icon }, idx) => {
          const pos1 = getLabelPos(angle);
          const pos2 = getLabelPos(labels[idx + 1]?.angle || labels[0].angle);
          
          return (
            <line
              key={`line-${idx}`}
              className="connection-line"
              x1={pos1.x}
              y1={pos1.y}
              x2={pos2.x}
              y2={pos2.y}
              stroke="rgba(44, 172, 136, 0.2)"
              strokeWidth="1"
            />
          );
        })}

        {/* Labels */}
        <g>
          {labels.map(({ angle, label, icon }, idx) => {
            const { x, y, z } = getLabelPos(angle);
            const scale = 0.75 + 0.35 * (z + 1);
            const opacity = 0.5 + 0.5 * (z + 1);
            const isSelected = selectedLabel === label;
            
            return (
              <g
                key={label}
                className={`label-group ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedLabel(selectedLabel === label ? null : label);
                  console.log(`[v0] Clicked ${label}`);
                }}
                onMouseEnter={() => {
                  setHoveredLabel(label);
                  setIsPaused(true);
                }}
                onMouseLeave={() => {
                  setHoveredLabel(null);
                  setIsPaused(false);
                }}
                style={{ cursor: "pointer" }}
              >
                <ellipse
                  cx={x}
                  cy={y}
                  rx={85}
                  ry={38}
                  fill={`url(#labelGrad-${idx})`}
                  opacity={opacity * 0.15}
                  filter="url(#globeGlow)"
                />
                
                <rect
                  className="label-rect"
                  x={x - 85}
                  y={y - 34}
                  rx={20}
                  ry={20}
                  width={170}
                  height={68}
                  fill={`url(#labelGrad-${idx})`}
                  opacity={opacity * 0.95}
                  filter="url(#shadow)"
                  style={{
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />
                
                <rect
                  x={x - 85}
                  y={y - 34}
                  rx={20}
                  ry={20}
                  width={170}
                  height={68}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="2"
                  opacity={opacity}
                  style={{ transition: "all 0.3s ease" }}
                />
                
                <text
                  className="label-icon"
                  x={x - 55}
                  y={y + 2}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fontFamily="Segoe UI Emoji, Inter, Arial, sans-serif"
                  fontWeight="bold"
                  fontSize="1.8rem"
                  fill="#fff"
                  style={{
                    transform: `scale(${scale})`,
                    opacity,
                    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transformOrigin: `${x - 55}px ${y + 2}px`,
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                  }}
                >
                  {icon}
                </text>
                <text
                  className="label-text"
                  x={x - 15}
                  y={y + 2}
                  textAnchor="start"
                  alignmentBaseline="middle"
                  fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
                  fontWeight="700"
                  fontSize="1.2rem"
                  fill="#fff"
                  style={{
                    transform: `scale(${scale})`,
                    opacity,
                    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transformOrigin: `${x - 15}px ${y + 2}px`,
                    textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                    letterSpacing: "0.5px",
                  }}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {!isDragging && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(47, 172, 136, 0.9)",
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "0.85rem",
            fontWeight: "600",
            color: "#fff",
            pointerEvents: "none",
            opacity: 0.8,
          }}
        >
          Drag to rotate • Click labels to explore
        </div>
      )}
    </div>
  );
};

export default WorldGlobe;
