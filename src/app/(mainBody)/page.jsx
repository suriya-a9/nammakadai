import { readdir } from "node:fs/promises";
import path from "node:path";
import Fashion5 from "@/components/themes/fashion/fashion5";

// Read the public banner directory for each homepage request, including newly added images.
export const dynamic = "force-dynamic";

async function getHomeBanners() {
  const bannerDirectory = path.join(process.cwd(), "public", "assets", "images", "banners");

  try {
    const entries = await readdir(bannerDirectory, { withFileTypes: true });
    const filenames = entries
      .filter((entry) => entry.isFile() && /\.(png|jpe?g|webp|avif|gif)$/i.test(entry.name))
      .map((entry) => entry.name)
      .sort((first, second) =>
        first.localeCompare(second, "en", { numeric: true, sensitivity: "base" })
      );

    return filenames.map((filename) => ({
      src: `/assets/images/banners/${encodeURIComponent(filename)}`,
      alt: filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim(),
    }));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

export default async function Home() {
  const homeBanners = await getHomeBanners();
  return <Fashion5 homeBanners={homeBanners} />;
}
