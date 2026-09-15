import SettingContext from "@/context/settingContext";
import Link from "next/link";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import CartButton from "./widgets/CartButton";
import ProductHoverButton from "./widgets/ProductHoverButton";
import ProductRatingBox from "./widgets/ProductRatingBox";
import OfferTimer from "@/components/productDetails/common/OfferTimer";

const ProductBox6 = ({ productState }) => {
  const { convertCurrency } = useContext(SettingContext);
  const { t } = useTranslation("common");
  const product = productState?.product;
  const gallery = product?.product_galleries || [];
  const primaryImage = productState?.selectedVariation?.variation_image?.original_url || product?.product_thumbnail?.original_url || "/assets/images/placeholder/product.png";
  const secondaryImage = !productState?.selectedVariation && gallery.length > 1 ? gallery[1]?.original_url : null;

  return (
    <>
      <div className="basic-product theme-product-5">
        <div className="img-wrapper">
          {product?.sale_starts_at && product?.sale_expired_at && <div className="d-none d-sm-flex"><OfferTimer productState={productState} noHeading /></div>}
          <Link href={`/product/${product?.slug}`} className={`nk-product-card-images ${secondaryImage ? "has-secondary" : ""}`}>
            <img src={primaryImage} className="img-fluid bg-img nk-product-card-primary" alt={product?.name} />
            {secondaryImage ? <img src={secondaryImage} className="img-fluid nk-product-card-secondary" alt={`${product?.name} alternate view`} /> : null}
            {gallery.length > 1 ? <span className="nk-product-image-count">+{gallery.length - 1}</span> : null}
          </Link>
          <div className="cart-info">
            <CartButton productState={productState} selectedVariation={productState.selectedVariation} />
            <ProductHoverButton productstate={product} />
          </div>
          {product?.is_trending || product?.is_sale_enable || product?.is_featured ? <label className="rotate-label">{product?.is_sale_enable ? "sale" : product?.is_featured ? "featured" : product?.is_trending ? "trending" : ""}</label> : null}
        </div>
        <div className="product-detail">
          <div className="brand-w-color">
            {product?.brand && (
              <Link className="product-title" href={`/brand/${product?.brand.slug}`}>
                {product?.brand.name}
              </Link>
            )}
            <div className="rating-w-count">
              <div className="rating">
                <ProductRatingBox ratingCount={productState?.rating_count} />
              </div>
              <span>({product?.reviews_count})</span>
            </div>
          </div>
          <h6>{product?.name}</h6>
          <h4 className="price">
            {productState?.selectedVariation ? convertCurrency(productState?.selectedVariation?.sale_price) : convertCurrency(product?.sale_price)}{" "}
            {productState?.selectedVariation ? (
              <>
                {productState?.selectedVariation?.price != productState?.selectedVariation?.sale_price || product?.price != product?.sale_price ? <del>{convertCurrency(productState?.selectedVariation?.price)}</del> : ""}
                <span className="discounted-price">
                  {productState?.selectedVariation?.discount} % {t("Off")}
                </span>
              </>
            ) : (
              <>
                {product?.price != product?.sale_price ? <del>{convertCurrency(product?.price)}</del> : ""}
                {product?.discount ? <span className="discounted-price">{product?.discount} % {t("Off")}</span> : null}
              </>
            )}
          </h4>
        </div>
      </div>
    </>
  );
};

export default ProductBox6;
