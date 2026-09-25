import RatingBox from "@/components/collection/collectionSidebar/RatingBox";
import CartContext from "@/context/cartContext";
import SettingContext from "@/context/settingContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import { Href } from "@/utils/constants";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiRulerLine } from "react-icons/ri";
import AddToCartButton from "./AddToCartButton";
import SizeModal from "./allModal/SizeModal";
import ProductAttribute from "./productAttribute/ProductAttribute";
import ProductDetailAction from "./ProductDetailAction";

const ProductContent = ({ productState, setProductState, productAccordion, noDetails, noQuantityButtons, noModals }) => {
  const { t } = useTranslation("common");
  const { handleIncDec, isLoading } = useContext(CartContext);
  const { convertCurrency } = useContext(SettingContext);
  const { setCartCanvas } = useContext(ThemeOptionContext);
  const router = useRouter();
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const assigned = productState?.product?.attributes || [];
  const selection = assigned.map(a=>({attribute_uuid:a.uuid,name:a.name,value_uuid:selectedAttributes[a.uuid],value:a.values.find(v=>v.uuid===selectedAttributes[a.uuid])?.value})).filter(a=>a.value_uuid);
  const selectionReady = selection.length===assigned.length;
  const selectedState = {...productState,selected_attributes:selection};
  const addToCart = () => {
    if (!selectionReady) { window.alert("Please select all product attributes"); return; }
    setCartCanvas(true);
    handleIncDec(productState?.productQty, productState?.product, false, false, false, selectedState);
  };
  const buyNow = () => {
    if (!selectionReady) { window.alert("Please select all product attributes"); return; }
    if (handleIncDec(productState?.productQty, productState?.product, false, false, false, selectedState)) router.push(`/checkout`);
  };
  const [modal, setModal] = useState("");
  const activeModal = {
    size: <SizeModal modal={modal} setModal={setModal} productState={productState} />,
  };

  return (
    <>
      {!noDetails && (
        <>
          <h2 className="main-title">{productState?.selectedVariation?.name ?? productState?.product?.name}</h2>
          {!productState?.product?.is_external && (
            <div className="product-rating">
              <RatingBox totalRating={productState?.selectedVariation?.rating_count ?? productState?.product?.rating_count} />
              <span className="divider">|</span>
              <a href={Href} className="mb-0">
                {productState?.selectedVariation?.reviews_count || productState?.product?.reviews_count || 0} {t("Review")}
              </a>
            </div>
          )}
          <div className="price-text">
            <h3>
              <span className="text-dark fw-normal">MRP:</span>
              {productState?.selectedVariation?.sale_price ? convertCurrency(productState?.selectedVariation?.sale_price) : convertCurrency(productState?.product?.sale_price)}

              {productState?.selectedVariation?.discount || productState?.product?.discount ? <del>{productState?.selectedVariation ? convertCurrency(productState?.selectedVariation?.price) : convertCurrency(productState?.product?.price)}</del> : null}

              {productState?.selectedVariation?.discount || productState?.product?.discount ? (
                <span className="discounted-price">
                  {productState?.selectedVariation ? productState?.selectedVariation?.discount : productState?.product?.discount} % {t("Off")}
                </span>
              ) : null}
            </h3>
            <span>{t("InclusiveAllTheTax")}</span>
          </div>
          {Number(productState?.product?.quantity) > 0 && Number(productState?.product?.quantity) < 5 && (
            <div className="product-low-stock-notice">
              <strong>Hurry! Only {productState.product.quantity} left in stock</strong>
              <span>Limited stock available. Order soon.</span>
            </div>
          )}
          {productState?.product.short_description && <p className="description-text">{productState?.product.short_description}</p>}
        </>
      )}
      {!noModals && productState?.product?.size_chart_image?.original_url ? (
        <>
          <div className="size-delivery-info">
            <a href={Href} onClick={(event) => { event.preventDefault(); setModal("size"); }}>
              <RiRulerLine /> {t("SizeChart")}
            </a>
          </div>
          {modal && activeModal[modal]}
        </>
      ) : null}

      {!noQuantityButtons && (
        <>
          {productState?.selectedVariation?.short_description && (
            <div className="product-contain">
              <p>{productState?.selectedVariation?.short_description ?? productState?.product?.short_description}</p>
            </div>
          )}
          {assigned.length > 0 && <div className="product-assigned-attributes" style={{marginBottom:16}}>
            {assigned.map(attribute=><div key={attribute.uuid} style={{marginBottom:12}}>
              <label htmlFor={`attribute-${attribute.uuid}`} style={{display:"block",fontWeight:600,marginBottom:6}}>{attribute.name} <span aria-hidden="true">*</span></label>
              <select id={`attribute-${attribute.uuid}`} className="form-select" required value={selectedAttributes[attribute.uuid]||""} onChange={event=>setSelectedAttributes(prev=>({...prev,[attribute.uuid]:event.target.value}))}>
                <option value="">Select {attribute.name}</option>
                {attribute.values.map(option=><option key={option.uuid} value={option.uuid}>{option.value}</option>)}
              </select>
            </div>)}
          </div>}
          {productState?.product.status && !productAccordion && <>{productState?.product?.type == "classified" && <ProductAttribute productState={productState} setProductState={setProductState} />}</>}
        </>
      )}
      {!productAccordion && (
        <div className="product-buttons">
          <ProductDetailAction productState={productState} setProductState={setProductState} />
          <AddToCartButton attributesReady={selectionReady} productState={productState} isLoading={isLoading} addToCart={addToCart} buyNow={buyNow} />
        </div>
      )}
    </>
  );
};

export default ProductContent;
