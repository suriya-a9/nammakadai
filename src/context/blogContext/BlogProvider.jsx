import { useEffect, useState } from "react";
import BlogContext from ".";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import request from "@/utils/axiosUtils";
import { BlogAPI } from "@/utils/axiosUtils/API";

const BlogProvider = (props) => {
  const [blogState, setBlogState] = useState([]);
  const [blogParams, setBlogParams] = useState("");

  const { data: BlogData, isLoading, refetch } = useFetchQuery([BlogAPI], () => request({ url: BlogAPI }), { enabled: false, refetchOnWindowFocus: false, select: (res) => res?.data?.data });

  useEffect(() => {
    BlogData && setBlogState(BlogData);
  }, [isLoading]);

  const handleSetQueryParams = (value) => {
    setBlogParams(value);
  };

  return (
    <>
      <BlogContext.Provider value={{refetch, handleSetQueryParams, blogParams, blogState, setBlogParams, blogContextLoader: isLoading, ...props }}>{props.children}</BlogContext.Provider>
    </>
  );
};

export default BlogProvider;
