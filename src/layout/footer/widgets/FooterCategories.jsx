import NoDataFound from "@/components/widgets/NoDataFound";
import CategoryContext from "@/context/categoryContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import { FilterItemIds } from "@/utils/customFunctions/FilterItemIds";
import Link from "next/link";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";

const FooterCategories = () => {
  const { themeOption } = useContext(ThemeOptionContext);
  const { filterCategory } = useContext(CategoryContext);
  const categoryData = filterCategory("product");
  const matchedCategories = FilterItemIds({ neededData: themeOption?.footer?.footer_categories, mainData: categoryData });
  const filteredCategories = matchedCategories?.length ? matchedCategories : categoryData?.slice(0, 6) || [];
  const { t } = useTranslation("common");

  return (
    <div className="footer-content">
      {filteredCategories?.length ? (
        <ul>
          {filteredCategories?.map((category) => (
            <li key={category.id}>
              <Link href={`/collections?category=${category?.slug}`} className="text-content">
                {t(category?.name)}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <NoDataFound customClass={"no-data-footer"} title={"NoCategoryFound"} />
      )}
    </div>
  );
};

export default FooterCategories;
