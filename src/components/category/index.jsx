import CategoryContext from "@/context/categoryContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import Loader from "@/layout/loader";
import Breadcrumbs from "@/utils/commonComponents/breadcrumb";
import { useCustomSearchParams } from "@/utils/hooks/useCustomSearchParams";
import { useContext, useEffect, useState } from "react";
import CollectionLeftSidebar from "../collection/collectionLeftSidebar";

const CategoryMainPage = ({ slug }) => {
  const { isLoading } = useContext(ThemeOptionContext);
  const [filter, setFilter] = useState({ category: [slug], brand: [], price: [], attribute: [], rating: [], page: 1, sortBy: "asc", field: "created_at" });
  const [brand, attribute, price, rating, sortBy, field, layout, page] = useCustomSearchParams(["brand", "attribute", "price", "rating", "sortBy", "field", "layout", "page"]);
  useEffect(() => {
    setFilter((prev) => {
      return {
        ...prev,
        page: page ? page?.page : 1,
        brand: brand ? brand?.brand?.split(",") : [],
        attribute: attribute ? attribute?.attribute?.split(",") : [],
        price: price ? price?.price?.split(",") : [],
        rating: rating ? rating?.rating?.split(",") : [],
        sortBy: sortBy ? sortBy?.sortBy : "asc",
        field: field ? field?.field : "created_at",
      };
    });
  }, [brand, attribute, price, rating, sortBy, field, page]);

  const { categoryIsLoading, filterCategory } = useContext(CategoryContext);
  const allCategories = filterCategory("product");
  const findCategory = (items = []) => {
    for (const item of items) {
      if (item.slug === slug || item.id === slug || item.uuid === slug) return item;
      const child = findCategory(item.subcategories || []);
      if (child) return child;
    }
    return null;
  };
  const currentCategory = findCategory(allCategories);
  const categoryName = currentCategory?.name || slug;
  if (categoryIsLoading) return <Loader />;
  return (
    <>
      <Breadcrumbs title={`Category: ${categoryName}`} subNavigation={[{ name: categoryName }]} />
      <CollectionLeftSidebar filter={filter} setFilter={setFilter} hideCategory categorySlug={slug} />
    </>
  );
};

export default CategoryMainPage;
