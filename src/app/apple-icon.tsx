import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #06b6d4 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 96,
          fontWeight: 900,
          letterSpacing: "-0.04em",
          borderRadius: 36,
        }}
      >
        A
      </div>
    ),
    { ...size }
  );
}
