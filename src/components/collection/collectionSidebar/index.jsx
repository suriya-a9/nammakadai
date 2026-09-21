import ThemeOptionContext from "@/context/themeOptionsContext";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiArrowLeftSLine } from "react-icons/ri";
import { Accordion, AccordionHeader, AccordionItem } from "reactstrap";
import CollectionCategory from "./CollectionCategory";
import CollectionFilter from "./CollectionFilter";
import CollectionPrice from "./CollectionPrice";

const CollectionSidebar = ({ filter, setFilter, isOffcanvas, basicStoreCard, sellerClass, hideCategory, categorySlug }) => {
  const { collectionMobile, setCollectionMobile, openOffCanvas, setOpenOffCanvas } = useContext(ThemeOptionContext);
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(["1", "2"]);
  const toggle = (id) => setOpen((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return (
    <>
      {collectionMobile && <div className="bg-overlay collection-overlay show" onClick={() => setCollectionMobile(false)} />}
      <div className={`${openOffCanvas ? "d-block" : ""} ${sellerClass || "col-xl-3 col-lg-4"}`}>
        <div className={`collection-filter sticky-top-section ${collectionMobile ? "open" : ""}`}>
          <div className="collection-filter-block accordion nk-collection-filters">
            {!isOffcanvas && (
              <div className="collection-mobile-back" onClick={() => setCollectionMobile((prev) => !prev)}>
                <span className="filter-back"><RiArrowLeftSLine />{t("Back")}</span>
              </div>
            )}
            {isOffcanvas && (
              <div className="collection-mobile-back" onClick={() => setOpenOffCanvas((prev) => !prev)}>
                <span className="filter-back"><RiArrowLeftSLine />{t("Back")}</span>
              </div>
            )}
            {basicStoreCard && basicStoreCard}
            {!isOffcanvas && <CollectionFilter filter={filter} setFilter={setFilter} categorySlug={categorySlug} />}
            <Accordion className={`collection-collapse-block ${isOffcanvas ? "row" : ""}`} open={open} toggle={toggle}>
              {!hideCategory && (
                <AccordionItem className={`collection-collapse-block nk-category-filter-card ${isOffcanvas ? "col-lg-6" : ""}`}>
                  <AccordionHeader targetId="1" className="collapse-block-title"><span>{t("Categories")}</span></AccordionHeader>
                  <CollectionCategory filter={filter} setFilter={setFilter} categorySlug={categorySlug} />
                </AccordionItem>
              )}
              <CollectionPrice isOffCanvas={isOffcanvas} filter={filter} setFilter={setFilter} />
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
};

export default CollectionSidebar;
