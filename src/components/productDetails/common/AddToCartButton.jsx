import Btn from "@/elements/buttons/Btn";
import { useTranslation } from "react-i18next";
import { RiShoppingCartLine } from "react-icons/ri";
const AddToCartButton = ({productState,addToCart,buyNow,extraOption,attributesReady=true}) => {
 const {t}=useTranslation("common");
 const enabled=attributesReady && productState?.product?.status!==0 && (productState?.product?.type==="simple" || Boolean(productState?.selectedVariation));
 return <div className="product-buy-btn-group">{productState?.product?.is_external ?
  <Btn className="btn-md bg-theme scroll-button" onClick={()=>window.open(productState.product.external_url,"_blank")}>{productState.product.external_button_text||t("BuyNow")}</Btn> : <>
  <Btn color="transparent" className="btn-animation btn-solid hover-solid buy-button bg-theme btn-md scroll-button" disabled={!enabled} onClick={addToCart}><RiShoppingCartLine className="me-2"/>{t("AddToCart")}</Btn>
  {extraOption!==false && <Btn className="btn-solid buy-button" disabled={!enabled} onClick={buyNow}>{t("BuyNow")}</Btn>}
 </>}</div>;
};
export default AddToCartButton;
