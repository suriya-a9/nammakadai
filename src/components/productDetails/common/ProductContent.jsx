import RatingBox from "@/components/collection/collectionSidebar/RatingBox";
import CartContext from "@/context/cartContext";
import SettingContext from "@/context/settingContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import { Href } from "@/utils/constants";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
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
  useEffect(()=>setSelectedAttributes({}),[productState?.product?.uuid]);
  const assigned = productState?.product?.attributes || [];
  const selection = assigned.map(a=>({attribute_uuid:a.uuid,name:a.name,value_uuid:selectedAttributes[a.uuid],value:a.values.find(v=>v.uuid===selectedAttributes[a.uuid])?.value})).filter(a=>a.value_uuid);
  const options = productState?.product?.variant_options || [];
  const selectionKey = selection.map(item => item.value_uuid).sort().join(":");
  // Match by the actual selected attribute values instead of relying only on the
  // persisted selection_key. This keeps the displayed variant price in sync even
  // for price groups created before selection keys were canonicalized.
  const exactOption = options.find(option => {
    if (selection.length !== assigned.length) return false;
    if (option.selection_key === selectionKey) return true;
    const optionValueIds = (option.selected_attributes || []).map(item => item.value_uuid).sort();
    const selectedValueIds = selection.map(item => item.value_uuid).sort();
    return optionValueIds.length === selectedValueIds.length &&
      optionValueIds.every((valueUuid, index) => valueUuid === selectedValueIds[index]);
  });
  const selectionReady = selection.length===assigned.length && (!options.length || Boolean(exactOption));
  // A partial selection may already identify one price group (e.g. Size 24).
  // Show its price immediately even while Hip / Height are still being selected.
  const matchingOptions = options.filter(option => selection.every(chosen =>
    option.selected_attributes.some(value => value.attribute_uuid === chosen.attribute_uuid && value.value_uuid === chosen.value_uuid)
  ));
  const matchingPrices = matchingOptions.map(option => ({
    price: Number(option.price), sale: Number(option.sale_price ?? option.price), group: option.price_group_uuid,
  }));
  const sharedPrice = selection.length > 0 && matchingPrices.length > 0 &&
    matchingPrices.every(item => item.price === matchingPrices[0].price && item.sale === matchingPrices[0].sale)
    ? matchingPrices[0] : null;
  const displayedPrice = exactOption ? Number(exactOption.sale_price ?? exactOption.price)
    : sharedPrice ? sharedPrice.sale
    : options.length ? (matchingPrices.length ? Math.min(...matchingPrices.map(item => item.sale)) : null) : null;
  const regularPrice = exactOption ? Number(exactOption.price) : sharedPrice?.price ?? null;
  const variantDiscount = regularPrice !== null && displayedPrice !== null && regularPrice > displayedPrice
    ? Math.round((regularPrice - displayedPrice) / regularPrice * 100) : 0;
  const selectedState = {...productState,selected_attributes:selection};
  const selectedProduct = exactOption ? {...productState.product,price:Number(exactOption.price),sale_price:Number(exactOption.sale_price ?? exactOption.price)} : productState.product;
  const addToCart = () => {
    if (!selectionReady) { window.alert("Please select all product attributes"); return; }
    setCartCanvas(true);
    handleIncDec(productState?.productQty, selectedProduct, false, false, false, selectedState);
  };
  const buyNow = () => {
    if (!selectionReady) { window.alert("Please select all product attributes"); return; }
    if (handleIncDec(productState?.productQty, selectedProduct, false, false, false, selectedState)) router.push(`/checkout`);
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
              {options.length > 0 && !exactOption && !sharedPrice && <small className="me-2">From </small>}
              {displayedPrice !== null ? convertCurrency(displayedPrice) : options.length ? "Select available options" : productState?.selectedVariation?.sale_price ? convertCurrency(productState?.selectedVariation?.sale_price) : convertCurrency(productState?.product?.sale_price)}

              {regularPrice !== null && displayedPrice !== null && displayedPrice < regularPrice ? <del>{convertCurrency(regularPrice)}</del> : null}
              {!options.length && displayedPrice === null && (productState?.selectedVariation?.discount || productState?.product?.discount) ? <del>{productState?.selectedVariation ? convertCurrency(productState?.selectedVariation?.price) : convertCurrency(productState?.product?.price)}</del> : null}

              {options.length ? (variantDiscount > 0 ? (
                <span className="discounted-price">{variantDiscount}% {t("Off")}</span>
              ) : null) : (productState?.selectedVariation?.discount || productState?.product?.discount ? (
                <span className="discounted-price">{productState?.selectedVariation ? productState?.selectedVariation?.discount : productState?.product?.discount}% {t("Off")}</span>
              ) : null)}
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
              <select id={`attribute-${attribute.uuid}`} className="form-select" required value={selectedAttributes[attribute.uuid]||""} onChange={event=>setSelectedAttributes(prev=>{const next={...prev,[attribute.uuid]:event.target.value};const index=assigned.findIndex(a=>a.uuid===attribute.uuid);assigned.slice(index+1).forEach(a=>delete next[a.uuid]);return next;})}>
                <option value="">Select {attribute.name}</option>
                {attribute.values.filter(value => !options.length || options.some(option => assigned.slice(0,assigned.findIndex(a=>a.uuid===attribute.uuid)).every(previous => !selectedAttributes[previous.uuid] || option.selected_attributes.some(a=>a.attribute_uuid===previous.uuid && a.value_uuid===selectedAttributes[previous.uuid])) && option.selected_attributes.some(a=>a.attribute_uuid===attribute.uuid&&a.value_uuid===value.uuid))).map(option=><option key={option.uuid} value={option.uuid}>{option.value}</option>)}
              </select>
            </div>)}
          </div>}
          {options.length>0 && !exactOption && selection.length===assigned.length && <small className="text-danger d-block mb-3">This combination is unavailable. Choose another measurement.</small>}
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
