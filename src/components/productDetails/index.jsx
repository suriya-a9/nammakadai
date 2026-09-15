"use client";
import ProductIdsContext from "@/context/productIdsContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import Loader from "@/layout/loader";
import request from "@/utils/axiosUtils";
import { ProductAPI } from "@/utils/axiosUtils/API";
import Breadcrumbs from "@/utils/commonComponents/breadcrumb";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import StickyCheckout from "./common/stickyCheckout";
import Product4Image from "./product4Image";
import ProductAccordion from "./productAccordion";
import ProductColumn from "./productColumn";
import ProductDigital from "./productDigital";
import ProductThumbnailImage from "./productImageOutside";
import ProductSidebarLayout from "./productSidebarLayout";
import ProductSlider from "./productSlider";
import ProductSticky from "./productSticky";
import ProductThumbnail from "./productThumbnail";
import ProductVerticalTab from "./productVerticalTab";

const ProductDetailContent = ({ params }) => {
  const router = useRouter();
  const { themeOption } = useContext(ThemeOptionContext);
  const { setGetProductIds, isLoading: productLoader } = useContext(ProductIdsContext);
  const searchParams = useSearchParams();
  const queryProductLayout = searchParams.get("layout");
  // Getting Product Layout
  const isProductLayout = useMemo(() => {
    return queryProductLayout ? queryProductLayout : themeOption?.product?.product_layout ?? "product_thumbnail";
  }, [queryProductLayout, themeOption]);

  const [productState, setProductState] = useState({ product: [], attributeValues: [], productQty: 1, selectedVariation: "", variantIds: [], statusIds: [] });

  // Calling Product API on slug
  const { data: ProductData, isLoading, refetch, error } = useFetchQuery([params], () => request({ url: `${ProductAPI}/${params}` }, router), { enabled: false, refetchOnWindowFocus: false, select: (res) => res?.data });
  // Calling Product API when params is there
  useEffect(() => {
    params && refetch();
  }, [params]);

  const productTitle = ProductData?.name || params?.replace(/-[0-9a-f]{8}$/i, "").replaceAll("-", " ");

  useEffect(() => {
    if (ProductData) {
      (ProductData?.cross_sell_products?.length > 0 || ProductData?.related_products?.length > 0) && setGetProductIds({ ids: Array.from(new Set([...ProductData?.cross_sell_products, ...ProductData?.related_products])).join(",") });
      setProductState((current) => ({ ...current, product: ProductData }));
    }
  }, [ProductData, setGetProductIds]);

  useEffect(() => {
    const handleScroll = () => {
      const button = document.querySelector(".scroll-button");
      if (button) {
        const buttonRect = button.getBoundingClientRect();
        if (buttonRect.bottom < window.innerHeight && buttonRect.bottom < 0) {
          document.body.classList.add("stickyCart");
        } else {
          document.body.classList.remove("stickyCart");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.classList?.remove("stickyCart");
    };
  }, []);

  if (isLoading) return <Loader />;

  const showProductLayout = {
    product_thumbnail: <ProductThumbnail productState={productState} setProductState={setProductState} />,
    product_images: <Product4Image productState={productState} setProductState={setProductState} />,
    product_sticky: <ProductSticky productState={productState} setProductState={setProductState} />,
    product_slider: <ProductSlider productState={productState} setProductState={setProductState} />,
    product_digital: <ProductDigital productState={productState} setProductState={setProductState} />,
    product_accordion: <ProductAccordion productState={productState} setProductState={setProductState} />,
    product_no_sidebar: <ProductThumbnail productState={productState} setProductState={setProductState} />,
    vertical_tab: <ProductVerticalTab productState={productState} setProductState={setProductState} />,
    product_thumbnail_left_image: <ProductThumbnailImage direction="left" productState={productState} setProductState={setProductState} />,
    product_thumbnail_right_image: <ProductThumbnailImage direction="right" productState={productState} setProductState={setProductState} />,
    product_thumbnail_image_outside: <ProductThumbnailImage productState={productState} setProductState={setProductState} />,
    product_sidebar_left: <ProductSidebarLayout productState={productState} setProductState={setProductState} direction="left" />,
    product_sidebar_right: <ProductSidebarLayout productState={productState} setProductState={setProductState} direction="right" />,
    product_column_thumbnail: <ProductColumn productState={productState} setProductState={setProductState} direction="bottom" />,
  };
  return (
    <>
      {<Breadcrumbs title={productTitle} subNavigation={[{ name: "Product" }, { name: productTitle }]} />}
      {showProductLayout[isProductLayout]}
      {ProductData && <StickyCheckout ProductData={ProductData} isLoading={isLoading} />}
    </>
  );
};

export default ProductDetailContent;
