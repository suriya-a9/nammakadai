import request from "@/utils/axiosUtils";
import { ProductAPI } from "@/utils/axiosUtils/API";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import { useEffect, useState } from "react";
import ProductIdsContext from ".";

const ProductIdsProvider = (props) => {
  const [getProductIds, setGetProductIds] = useState({});
  const [filteredProduct, setFilteredProduct] = useState([]);
  const { data, refetch, isLoading, isRefetching } = useFetchQuery([ProductAPI, getProductIds?.ids], () => request({ url: ProductAPI, params: { ...getProductIds, status: 1, paginate: getProductIds?.ids?.length } }), {
    enabled: false,
    refetchOnWindowFocus: false,
    select: (data) => data?.data?.data,
  });

  useEffect(() => {
    Object.keys(getProductIds).length > 0 && refetch();
  }, [getProductIds?.ids]);

  useEffect(() => {
    if (data) {
      setFilteredProduct((prev) => data);
    }
  }, [isLoading, getProductIds]);

  return <ProductIdsContext.Provider value={{ ...props, filteredProduct, setGetProductIds, isLoading, isRefetching }}>{props.children}</ProductIdsContext.Provider>;
};

export default ProductIdsProvider;
