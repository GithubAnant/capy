import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Capy — The AI-Native Code Editor";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            display: "flex",
          }}
        />

        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            width: "800px",
            height: "800px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 600,
              color: "#F0F0F3",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              display: "flex",
            }}
          >
            capy
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#858585",
              marginTop: 24,
              letterSpacing: "-0.01em",
              display: "flex",
            }}
          >
            The AI-native code editor
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#555555",
              marginTop: 16,
              display: "flex",
            }}
          >
            Code with exact precision.
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: "#555555",
              display: "flex",
            }}
          >
            capy.anants.studio
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
