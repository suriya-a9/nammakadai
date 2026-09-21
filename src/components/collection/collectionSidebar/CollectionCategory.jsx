import NoDataFound from "@/components/widgets/NoDataFound";
import CategoryContext from "@/context/categoryContext";
import { useCustomSearchParams } from "@/utils/hooks/useCustomSearchParams";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiArrowDownSLine, RiArrowRightSLine } from "react-icons/ri";
import { AccordionBody, Input, Label } from "reactstrap";

const CollectionCategory = ({ filter, setFilter, categorySlug }) => {
  const [price, sortBy, field, layout] = useCustomSearchParams(["price", "sortBy", "field", "layout"]);
  const { filterCategory, categoryData } = useContext(CategoryContext);
  const [keyword, setKeyword] = useState("");
  const { t } = useTranslation("common");
  const router = useRouter();
  const pathname = usePathname();
  const categories = filterCategory("product") || [];

  const filterTree = (item, term) => {
    if (item.name?.toLowerCase().includes(term)) return item;
    const matchedChildren = (item.subcategories || []).map((child) => filterTree(child, term)).filter(Boolean);
    return matchedChildren.length ? { ...item, subcategories: matchedChildren } : null;
  };
  const visibleCategories = keyword.trim()
    ? categories.map((item) => filterTree(item, keyword.trim().toLowerCase())).filter(Boolean)
    : categories;

  const redirectToCollection = (slug) => {
    const old = filter?.category || [];
    const selected = old.includes(slug) ? old.filter((item) => item !== slug) : [...old, slug];
    setFilter((prev) => ({ ...prev, category: selected }));
    const params = new URLSearchParams({ ...price, ...sortBy, ...field, ...layout });
    if (selected.length) params.set("category", selected.join(","));
    router.push(`${pathname}${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <div className="accordion-collapse collapse show">
      <AccordionBody accordionId="1">
        {categories.length > 5 && (
          <div className="theme-form search-box">
            <Input aria-label="Search categories" placeholder={t("Search")} value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          </div>
        )}
        <div className="nk-category-scroll">
          {visibleCategories.length > 0 ? (
            <RecursiveCategory categories={visibleCategories} selected={filter?.category || []} searchActive={Boolean(keyword.trim())} onToggle={redirectToCollection} />
          ) : (
            <NoDataFound customClass="search-not-found-box" title="NoCategoryFound" />
          )}
        </div>
      </AccordionBody>
    </div>
  );
};

const containsSelected = (category, selected) =>
  (category.subcategories || []).some((child) => selected.includes(child.slug) || containsSelected(child, selected));

const RecursiveCategory = ({ categories, selected, searchActive, onToggle }) => (
  <ul className="shop-category-list nk-category-tree">
    {categories.map((category) => (
      <CategoryTreeItem
        key={category.uuid || category.slug}
        category={category}
        selected={selected}
        searchActive={searchActive}
        onToggle={onToggle}
      />
    ))}
  </ul>
);

const CategoryTreeItem = ({ category, selected, searchActive, onToggle }) => {
  const children = category.subcategories || [];
  const hasChildren = children.length > 0;
  const [expanded, setExpanded] = useState(() => containsSelected(category, selected));
  useEffect(() => {
    if (containsSelected(category, selected)) setExpanded(true);
  }, [category, selected]);
  const isOpen = searchActive || expanded;
  const inputId = `nk-filter-${category.uuid || category.slug}`;

  return (
    <li className="nk-category-node">
      <div className="nk-category-node-row">
        <div className="form-check collection-filter-checkbox">
          <Input className="form-check-input" type="checkbox" id={inputId} checked={selected.includes(category.slug)} onChange={() => onToggle(category.slug)} />
          <Label className="form-check-label" htmlFor={inputId}><span className="name">{category.name}</span></Label>
        </div>
        {hasChildren && (
          <button
            type="button"
            className="nk-subcategory-toggle"
            aria-label={`${isOpen ? "Hide" : "Show"} subcategories of ${category.name}`}
            aria-expanded={isOpen}
            onClick={() => setExpanded((value) => !value)}
          >
            {isOpen ? <RiArrowDownSLine /> : <RiArrowRightSLine />}
          </button>
        )}
      </div>
      {hasChildren && isOpen && (
        <div className="nk-subcategory-panel">
          <RecursiveCategory categories={children} selected={selected} searchActive={searchActive} onToggle={onToggle} />
        </div>
      )}
    </li>
  );
};

export default CollectionCategory;
