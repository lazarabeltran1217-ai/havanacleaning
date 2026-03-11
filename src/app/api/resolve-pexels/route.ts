import { NextRequest, NextResponse } from "next/server";

/**
 * Resolves a Pexels video URL to a direct video file URL using the Pexels API.
 * Requires PEXELS_API_KEY in environment variables.
 */
export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "PEXELS_API_KEY not configured. Get a free key at pexels.com/api" },
      { status: 500 }
    );
  }

  // Extract video ID from various Pexels URL formats
  const videoId = extractPexelsVideoId(url);
  if (!videoId) {
    return NextResponse.json(
      { error: "Could not extract video ID from URL. Paste a Pexels video or download URL." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`https://api.pexels.com/videos/videos/${videoId}`, {
      headers: { Authorization: apiKey },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Pexels API returned ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const files = data.video_files as {
      id: number;
      quality: string;
      file_type: string;
      width: number;
      height: number;
      link: string;
    }[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No video files found" }, { status: 404 });
    }

    // Pick the best HD file (prefer 1080p mp4, fallback to largest)
    const mp4Files = files.filter((f) => f.file_type === "video/mp4");
    const hd1080 = mp4Files.find((f) => f.width === 1920 || f.height === 1080);
    const hd720 = mp4Files.find((f) => f.width === 1280 || f.height === 720);
    const best = hd1080 || hd720 || mp4Files.sort((a, b) => b.width - a.width)[0];

    if (!best) {
      return NextResponse.json({ error: "No MP4 files found" }, { status: 404 });
    }

    // Also get poster image
    const posterUrl = data.image || "";

    return NextResponse.json({
      videoUrl: best.link,
      posterUrl,
      width: best.width,
      height: best.height,
      quality: best.quality,
    });
  } catch (error) {
    console.error("Pexels API error:", error);
    return NextResponse.json({ error: "Failed to fetch from Pexels API" }, { status: 502 });
  }
}

function extractPexelsVideoId(url: string): string | null {
  // https://www.pexels.com/download/video/4109227/
  const downloadMatch = url.match(/pexels\.com\/download\/video\/(\d+)/);
  if (downloadMatch) return downloadMatch[1];

  // https://www.pexels.com/video/cleaning-wooden-furniture-4109227/
  const pageMatch = url.match(/pexels\.com\/video\/[^/]*?(\d+)\/?$/);
  if (pageMatch) return pageMatch[1];

  // https://videos.pexels.com/video-files/4109227/...
  const cdnMatch = url.match(/videos\.pexels\.com\/video-files\/(\d+)/);
  if (cdnMatch) return cdnMatch[1];

  // Just a plain number
  if (/^\d+$/.test(url.trim())) return url.trim();

  return null;
}
