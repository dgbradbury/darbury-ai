import { ImageResponse } from "next/og";
import { OG_SIZE, OgFrame, loadOgFonts, publicImageDataUri } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt =
  "Darbury AI — 42 years of engineering problems, solved faster with AI";

export default async function Image() {
  const lockup = await publicImageDataUri("/images/darbury-lockup-white.png");

  return new ImageResponse(
    (
      <OgFrame>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {lockup && <img src={lockup} alt="" style={{ height: 64, alignSelf: "flex-start" }} />}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div
            style={{
              fontFamily: "Inter",
              fontSize: 24,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#189B93",
              marginBottom: 24,
            }}
          >
            Dave Bradbury · Darbury Ltd
          </div>
          <div
            style={{
              fontFamily: "Barlow Condensed",
              fontWeight: 700,
              fontSize: 92,
              lineHeight: 1.02,
              textTransform: "uppercase",
              color: "#F0F2F3",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>42 Years of Engineering Problems.</span>
            <span style={{ color: "#189B93" }}>Solved Faster with AI.</span>
          </div>
          <div
            style={{
              fontFamily: "Inter",
              fontSize: 28,
              color: "#78919E",
              marginTop: 28,
            }}
          >
            Live AI tools for Plant 3D, P&IDs & engineering workflows — darbury.ai
          </div>
        </div>
      </OgFrame>
    ),
    { ...size, fonts: loadOgFonts() }
  );
}
