import request from "@/utils/axiosUtils";
import { BrandLogo } from "@/utils/axiosUtils/API";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BrandIdsContext from ".";

const BrandIdsProvider = (props) => {
  const router = useRouter();
  const [getBrandIds, setGetBrandIds] = useState({});
  const [filteredBrand, setFilteredBrand] = useState([]);
  const { data, refetch, isLoading } = useFetchQuery([BrandLogo, getBrandIds?.ids], () => request({ url: BrandLogo, params: { ...getBrandIds, status: 1 } }, router), {
    enabled: false,
    refetchOnWindowFocus: false,
    select: (data) => data.data.data,
  });

  useEffect(() => {
    Object.keys(getBrandIds).length > 0 && refetch();
  }, [getBrandIds?.ids]);

  useEffect(() => {
    if (data) {
      setFilteredBrand((prev) => data);
    }
  }, [isLoading, getBrandIds]);
  return <BrandIdsContext.Provider value={{ ...props, filteredBrand, setGetBrandIds, brandIdsLoader: isLoading }}>{props.children}</BrandIdsContext.Provider>;
};

export default BrandIdsProvider;
