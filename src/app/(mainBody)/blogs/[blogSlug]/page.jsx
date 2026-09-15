import SingleBlog from "@/components/blogs/singleBlog";
export async function generateMetadata({ params }) {
  const blogData = await fetch(`${process.env.API_PROD_URL}/blog/slug/${params?.blogSlug}`)
    .then((res) => res.json())
    .catch((err) => console.log("err", err));
  return {
    title: blogData?.meta_title,
    description: blogData?.meta_description,
    images: [blogData?.blog_meta_image?.original_url, []],
    openGraph: {},
  };
}

const BlogDetailContent = async ({ params }) => {
  const { blogSlug } = await params;
  return <>{blogSlug && <SingleBlog params={blogSlug} />}</>;
};

export default BlogDetailContent;
