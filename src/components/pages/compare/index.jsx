"use client";
import CompareSidebar from "@/components/widgets/productBox/widgets/CompareSidebar";
import WrapperComponent from "@/components/widgets/WrapperComponent";
import CompareContext from "@/context/compareContext";
import Loader from "@/layout/loader";
import Breadcrumbs from "@/utils/commonComponents/breadcrumb";
import CompareData from "./CompareData";
import { useContext } from "react";

const CompareList = () => {
  const { getCompareLoading } = useContext(CompareContext);
  if (getCompareLoading) return <Loader />;
  return (
    <>
      <Breadcrumbs title={"Compare"} subNavigation={[{ name: "Compare" }]} />
      <WrapperComponent classes={{ sectionClass: "compare-section section-b-space ratio_asos", fluidClass: "container" }} colProps={{ xs: "12" }}>
        <CompareData />
      </WrapperComponent>
      <CompareSidebar />
    </>
  );
};

export default CompareList;
