import { NextResponse } from "next/server";

const instagramUsername = "nammakadai_bharathi";

export async function GET() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken) {
    return NextResponse.json({ banners: [], configured: false });
  }

  const params = new URLSearchParams({
    fields: "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp",
    limit: "7",
    access_token: accessToken,
  });

  try {
    const response = await fetch(`https://graph.instagram.com/me/media?${params}`, {
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      return NextResponse.json({ banners: [], configured: true }, { status: response.status });
    }

    const { data = [] } = await response.json();
    const banners = data
      .filter((post) => post.media_url && ["IMAGE", "CAROUSEL_ALBUM", "VIDEO"].includes(post.media_type))
      .map((post) => ({
        status: true,
        image_url: post.thumbnail_url || post.media_url,
        redirect_link: {
          link: post.permalink || `https://www.instagram.com/${instagramUsername}/`,
          link_type: "external_url",
        },
      }));

    return NextResponse.json({ banners, configured: true });
  } catch {
    return NextResponse.json({ banners: [], configured: true }, { status: 502 });
  }
}