import { placeHolderImage } from "@/components/widgets/Placeholder";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import ImageZoom from "react-image-zooom";
import DigitalImageOptions from "../common/DigitalImageOptions";

const ThumbnailProductImage = ({ productState }) => {
  const { t } = useTranslation("common");
  const [activeIndex, setActiveIndex] = useState(0);

  const gallery = useMemo(() => {
    const variationGallery = productState?.selectedVariation?.variation_galleries;
    const productGallery = productState?.product?.product_galleries;
    const images = variationGallery?.length ? variationGallery : productGallery;
    if (images?.length) return images;
    return [
      {
        id: "placeholder",
        original_url: productState?.product?.product_thumbnail?.original_url || placeHolderImage,
        name: productState?.product?.name || "Product image",
      },
    ];
  }, [productState?.selectedVariation?.variation_galleries, productState?.product?.product_galleries, productState?.product?.product_thumbnail?.original_url, productState?.product?.name]);

  useEffect(() => {
    setActiveIndex(0);
  }, [productState?.product?.id, productState?.selectedVariation?.id, gallery.length]);

  const activeImage = gallery[activeIndex] || gallery[0];
  const goPrevious = () => setActiveIndex((index) => (index <= 0 ? gallery.length - 1 : index - 1));
  const goNext = () => setActiveIndex((index) => (index >= gallery.length - 1 ? 0 : index + 1));

  return (
    <div className="sticky-top-custom nk-product-gallery">
      <div className="nk-product-gallery-main">
        {productState?.product?.is_sale_enable || productState?.product?.is_trending || productState?.product?.is_featured ? (
          <ul className="product-detail-label nk-product-gallery-label">
            {productState?.product?.is_sale_enable ? <li className="soldout">{t("Sale")}</li> : null}
            {productState?.product?.is_trending ? <li className="trending">{t("Trending")}</li> : null}
            {productState?.product?.is_featured ? <li className="featured">{t("Featured")}</li> : null}
          </ul>
        ) : null}

        <div className="nk-product-gallery-zoom" title="Move over the image to zoom">
          <ImageZoom
            key={activeImage?.id || activeImage?.uuid || activeImage?.original_url || activeIndex}
            src={activeImage?.original_url || placeHolderImage}
            alt={activeImage?.name || productState?.product?.name || "Product image"}
            zoom="220"
            className="nk-product-gallery-main-image"
          />
        </div>

        {gallery.length > 1 ? (
          <>
            <button type="button" className="nk-product-gallery-arrow prev" aria-label="Previous product image" onClick={goPrevious}>
              <RiArrowLeftSLine />
            </button>
            <button type="button" className="nk-product-gallery-arrow next" aria-label="Next product image" onClick={goNext}>
              <RiArrowRightSLine />
            </button>
            <span className="nk-product-gallery-count">{activeIndex + 1} / {gallery.length}</span>
          </>
        ) : null}

        {productState?.product?.product_type === "digital" ? <DigitalImageOptions product={productState?.product} /> : null}
      </div>

      {gallery.length > 1 ? (
        <div className="nk-product-gallery-thumbs" aria-label="Product images">
          {gallery.map((image, index) => (
            <button
              type="button"
              key={image.id || image.uuid || `${image.original_url}-${index}`}
              className={`nk-product-gallery-thumb ${index === activeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show product image ${index + 1}`}
            >
              <img src={image?.original_url || placeHolderImage} alt={image?.name || `${productState?.product?.name || "Product"} ${index + 1}`} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ThumbnailProductImage;