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
  const addToCart = () => {
    setCartCanvas(true);
    handleIncDec(productState?.productQty, productState?.product, false, false, false, productState);
  };
  const buyNow = () => {
    handleIncDec(productState?.productQty, productState?.product, false, false, false, productState);
    router.push(`/checkout`);
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
          {productState?.product.status && !productAccordion && <>{productState?.product?.type == "classified" && <ProductAttribute productState={productState} setProductState={setProductState} />}</>}
        </>
      )}
      {!productAccordion && (
        <div className="product-buttons">
          <ProductDetailAction productState={productState} setProductState={setProductState} />
          <AddToCartButton productState={productState} isLoading={isLoading} addToCart={addToCart} buyNow={buyNow} />
        </div>
      )}
    </>
  );
};

export default ProductContent;
