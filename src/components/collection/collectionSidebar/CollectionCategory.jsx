import NoDataFound from "@/components/widgets/NoDataFound";
import CategoryContext from "@/context/categoryContext";
import { useCustomSearchParams } from "@/utils/hooks/useCustomSearchParams";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AccordionBody, Input, Label } from "reactstrap";

const CollectionCategory = ({ filter, setFilter, categorySlug }) => {
  const [brand, attribute, price, rating, sortBy, field, layout] = useCustomSearchParams(["brand", "attribute", "price", "rating", "sortBy", "field", "layout"]);
  const { filterCategory, categoryData } = useContext(CategoryContext);

  const getCategoryList = () => {
    // Always show the complete category tree in the collection sidebar.
    // categorySlug is still used by the product query as the default filter for
    // a category page, but it must not hide the other category choices.
    return filterCategory("product");
  };

  const [showList, setShowList] = useState(getCategoryList());
  const [state, setState] = useState(false);
  const { t } = useTranslation("common");

  useEffect(() => {
    setShowList(getCategoryList());
  }, [categorySlug, categoryData]);

  const router = useRouter();
  const pathname = usePathname();
  const hasValue = (item, term) => {
    let valueToReturn = false;
    if (item && item["name"] && item["name"].toLowerCase().includes(term?.toLowerCase())) {
      valueToReturn = true;
    }
    item["subcategories"]?.length &&
      item["subcategories"].forEach((child) => {
        if (hasValue(child, term)) {
          valueToReturn = true;
        }
      });
    return valueToReturn;
  };

  const filterCategories = (item, term) => {
    const matchingSubcategories = item.subcategories?.map((subcat) => filterCategories(subcat, term)).filter((subcat) => subcat);

    if (item.name.toLowerCase().includes(term.toLowerCase()) || matchingSubcategories?.length) {
      return {
        ...item,
        subcategories: matchingSubcategories,
      };
    }
    return null;
  };

  const handleChange = (event) => {
    setState(!state);
    const keyword = event.target.value.toLowerCase();
    if (keyword !== "") {
      const updatedData = getCategoryList()
        ?.map((item) => filterCategories(item, keyword))
        .filter((item) => item);
      setShowList(updatedData);
    } else {
      setShowList(getCategoryList());
    }
  };
  const redirectToCollection = (event, slug) => {
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
      const queryParams = new URLSearchParams({ ...brand, ...attribute, ...price, ...sortBy, ...field, ...rating, ...layout, category: temp }).toString();
      router.push(`${pathname}?${queryParams}`);
    } else {
      const queryParams = new URLSearchParams({ ...brand, ...attribute, ...price, ...sortBy, ...field, ...rating, ...layout }).toString();
      router.push(`${pathname}?${queryParams}`);
    }
  };
  return (
    <div className="accordion-collapse collapse show">
      <AccordionBody accordionId="1">
        {getCategoryList().length > 5 && (
          <div className="theme-form search-box">
            <Input placeholder={t("Search")} onChange={handleChange} />
          </div>
        )}

        {showList?.length > 0 ? <RecursiveCategory redirectToCollection={redirectToCollection} categories={showList} filter={filter} /> : <NoDataFound customClass="search-not-found-box" title="NoCategoryFound" />}
      </AccordionBody>
    </div>
  );
};

export default CollectionCategory;

const RecursiveCategory = ({ redirectToCollection, categories, filter }) => (
  <ul className="shop-category-list custom-sidebar-height">
    {categories.map((elem, i) => (
      <li key={i}>
        <div className="form-check collection-filter-checkbox">
          <Input className="form-check-input" type="checkbox" id={elem?.name} checked={filter?.category?.includes(elem?.slug)} onChange={(e) => redirectToCollection(e, elem?.slug)} />
          <Label className="form-check-label" htmlFor={elem?.name}>
            <span className="name">{elem?.name}</span>
          </Label>
        </div>
        {elem.subcategories.length > 0 ? (
          <ul className="sub-category-list">
            <RecursiveCategory redirectToCollection={redirectToCollection} categories={elem?.subcategories} filter={filter} />
          </ul>
        ) : null}
      </li>
    ))}
  </ul>
);
