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
    attribute: splitFilter("attribute"),
    price: splitFilter("price"),
    rating: splitFilter("rating"),
    brand: splitFilter("brand"),
  };
  const mergeFilter = () => {
    setSelectedFilters([...filterObj["category"], ...filterObj["brand"], ...filterObj["attribute"], ...filterObj["price"], ...filterObj["rating"].map((val) => (val.startsWith("rating ") ? val : `rating ${val}`))]);
  };
  useEffect(() => {
    mergeFilter();
  }, [filter]);

  const removeParams = (slugValue) => {
    Object.keys(filterObj).forEach((key) => {
      filterObj[key] = filterObj[key].filter((val) => {
        if (key === "rating") {
          return val !== slugValue.replace(/^rating /, "");
        }
        return val !== slugValue;
      });
      mergeFilter();
      setFilter(filterObj);
      const params = {};
      Object.keys(filterObj).forEach((key) => {
        if (filterObj[key].length > 0) {
          params[key] = filterObj[key].join(",");
        }
      });
      const queryParams = new URLSearchParams({ ...params, ...layout }).toString();
      router.push(`${pathname}?${queryParams}`);
    });
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
