import Avatar from "@/components/widgets/Avatar";
import NoDataFound from "@/components/widgets/NoDataFound";
import { placeHolderImage } from "@/components/widgets/Placeholder";
import WrapperComponent from "@/components/widgets/WrapperComponent";
import CategoryContext from "@/context/categoryContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import { CollectionCategorySlider } from "@/data/sliderSetting/SliderSetting";
import { Href } from "@/utils/constants";
import { useCustomSearchParams } from "@/utils/hooks/useCustomSearchParams";
import { usePathname, useRouter } from "next/navigation";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import Slider from "react-slick";

const CollectionSlider = ({ filter, setFilter }) => {
  const [attribute, price, rating, sortBy, field, layout] = useCustomSearchParams(["attribute", "price", "rating", "sortBy", "field", "layout"]);
  const { filterCategory } = useContext(CategoryContext);
  const { themeOption } = useContext(ThemeOptionContext);
  const categoryData = filterCategory("product");
  const { t } = useTranslation("common");
  const pathname = usePathname();
  const router = useRouter();
  const redirectToCollection = (slug) => {
    let temp = [...filter?.category];
    if (!temp.includes(slug)) {
      temp.push(slug);
    } else {
      temp = temp.filter((elem) => elem !== slug);
    }
    setFilter((prev) => {
      return {
        ...prev,
        category: temp,
      };
    });
    if (temp.length > 0) {
      const queryParams = new URLSearchParams({ ...attribute, ...price, ...rating, ...sortBy, ...field, ...layout, category: temp }).toString();
      router.push(`${pathname}?${queryParams}`);
    } else {
      const queryParams = new URLSearchParams({ ...attribute, ...price, ...rating, ...sortBy, ...field, ...layout }).toString();
      router.push(`${pathname}?${queryParams}`);
    }
  };

  return (
    <WrapperComponent classes={{ containerClass: "container-fluid-lg" }} colProps={{ xs: 12 }}>
      {categoryData?.length > 0 ? (
        <div className="product-wrapper no-arrow category-slider">
          <Slider {...CollectionCategorySlider}>
            {categoryData
              ?.map((elem, i) => (
                <div key={i}>
                  <a href={Href} className={`category-box category-dark ${filter?.category?.includes(elem.slug) ? "active" : ""}`} onClick={() => redirectToCollection(elem?.slug)}>
                    <Avatar data={elem?.category_icon} placeHolder={placeHolderImage} name={elem?.name} height={45} width={187} customClass={"shop-category-image"} />
                    <div className="category-box-name">
                      <h5>{elem?.name}</h5>
                    </div>
                  </a>
                </div>
              ))}
          </Slider>
        </div>
      ) : (
        <NoDataFound customClass="bg-light no-data-added" title="NoCategoryFound" />
      )}
    </WrapperComponent>
  );
};

export default CollectionSlider;
