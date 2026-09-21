import Blogs from "../../../components/blogs/Details";
import { Suspense } from "react";

const BlogPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Blogs />
    </Suspense>
  );
};

export default BlogPage;