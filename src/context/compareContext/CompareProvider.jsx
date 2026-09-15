import request from "@/utils/axiosUtils";
import { CompareAPI } from "@/utils/axiosUtils/API";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import CompareContext from ".";

const CompareProvider = (props) => {
  const cookieUAT = Cookies.get("uat");
  const [compareState, setCompareState] = useState([]);
  const [openCompareSidebar, setOpenCompareSidebar] = useState(false);
  const { data: CompareData, isLoading: getCompareLoading, refetch } = useFetchQuery([CompareAPI], () => request({ url: CompareAPI }), { enabled: false, refetchOnWindowFocus: false, select: (res) => res?.data?.data });
  useEffect(() => {
    if (cookieUAT) {
      refetch();
    }
  }, [cookieUAT]);
  useEffect(() => {
    if (CompareData) {
      setCompareState([...compareState, ...CompareData]);
    }
  }, [getCompareLoading]);
  return <CompareContext.Provider value={{ ...props,openCompareSidebar,setOpenCompareSidebar, compareState, setCompareState, refetch,CompareData,getCompareLoading }}>{props.children}</CompareContext.Provider>;
};

export default CompareProvider;
