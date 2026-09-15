import BrandContainer from "@/components/brand";

export async function generateMetadata({ params }) {
  // fetch data
  const { slug } = await params;
  const brandData = await fetch(`${process.env.API_PROD_URL}/brand/slug/${slug}`)
    .then((res) => res.json())
    .catch((err) => console.log("err", err));
  return {
    title: brandData?.meta_title,
    description: brandData?.meta_description,
    images: [brandData?.brand_meta_image?.original_url, []],
    openGraph: {},
  };
}

const BrandPage = async ({ params }) => {
  const { slug } = await params;
  return <BrandContainer params={slug} />;
};

export default BrandPage;
