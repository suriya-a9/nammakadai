import CategoryContext from "@/context/categoryContext";
import { useCustomSearchParams } from "@/utils/hooks/useCustomSearchParams";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiCloseLine } from "react-icons/ri";

const CollectionFilter = ({ filter, setFilter, categorySlug }) => {
  const router = useRouter();
  const [layout] = useCustomSearchParams(["layout"]);
  const { t } = useTranslation("common");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const pathname = usePathname();
  const { filterCategory } = useContext(CategoryContext);

  const categoryNameByValue = (value) => {
    const findCategory = (items = []) => {
      for (const item of items) {
        if (item?.slug === value || item?.uuid === value || item?.id === value) return item?.name;
        const childName = findCategory(item?.subcategories || []);
        if (childName) return childName;
      }
      return null;
    };

    return findCategory(filterCategory("product"));
  };

  const splitFilter = (filterKey) => {
    return filter && filter[filterKey] ? filter[filterKey] : [];
  };
  const filterObj = {
    category: splitFilter("category"),
    price: splitFilter("price"),
  };
  const mergeFilter = () => {
    setSelectedFilters([...filterObj["category"], ...filterObj["price"]]);
  };
  useEffect(() => {
    mergeFilter();
  }, [filter]);

  const removeParams = (slugValue) => {
    const next = {
      category: filterObj.category.filter((value) => value !== slugValue),
      price: filterObj.price.filter((value) => value !== slugValue),
    };
    setFilter((prev) => ({ ...prev, ...next }));
    const params = new URLSearchParams(layout);
    if (next.category.length) params.set("category", next.category.join(","));
    if (next.price.length) params.set("price", next.price.join(","));
    router.push(`${pathname}${params.toString() ? `?${params}` : ""}`);
  };

  const clearParams = () => {
    // Get the current path without query parameters
    const pathWithoutQuery = pathname;

    // Navigate to the same route without query parameters
    router.push(pathWithoutQuery);
  };

  const ModifyWord = (value) => {
    const categoryName = categoryNameByValue(value);
    if (categoryName) return categoryName;

    return value
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (selectedFilters.length <= 0) return null;
  return (
    <div className="shop-filter-category">
      <div className="filter-title">
        <h2>{t("Filters")}</h2>
        <a onClick={clearParams}>{t("ClearAll")}</a>
      </div>
      <ul className="filter-list">
        {selectedFilters?.map((elem, i) => (
          <li key={i}>
            <a>{ModifyWord(elem)}</a>
            <RiCloseLine className="close-icon" onClick={() => removeParams(elem)} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CollectionFilter;
