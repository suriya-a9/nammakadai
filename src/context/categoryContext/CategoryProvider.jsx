import React, { useEffect, useState } from "react";
import { CategoryAPI } from "@/utils/axiosUtils/API";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import request from "@/utils/axiosUtils";
import CategoryContext from ".";
import { useRouter } from "next/navigation";

const CategoryProvider = (props) => {
  const router = useRouter();
  const [categoryAPIData, setCategoryAPIData] = useState({ data: [], refetchCategory: "", params: {}, categoryIsLoading: false });
  const {
    data: categoryData,
    refetch,
    isLoading: categoryIsLoading,
  } = useFetchQuery([CategoryAPI], () => request({ url: CategoryAPI, params: { ...categoryAPIData.params, status: 1 } }, router), {
    enabled: false,
    refetchOnWindowFocus: false,
    select: (data) => data.data?.data,
  });

  const filterCategory = (value) => {
    return categoryData?.filter((elem) => elem.type === value) || [];
  };

  useEffect(() => {
    refetch();
  }, []);

  // Setting Data on Category variables
  useEffect(() => {
    if (categoryData) {
      setCategoryAPIData((prev) => ({ ...prev, data: categoryData, categoryIsLoading: categoryIsLoading }));
    }
  }, [categoryData]);

  return <CategoryContext.Provider value={{ ...props, categoryAPIData, setCategoryAPIData, filterCategory: filterCategory, categoryIsLoading, categoryData }}>{props.children}</CategoryContext.Provider>;
};

export default CategoryProvider;
