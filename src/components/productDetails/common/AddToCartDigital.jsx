import Btn from "@/elements/buttons/Btn";
import { useTranslation } from "react-i18next";
import { RiShoppingCartLine } from "react-icons/ri";
const AddToCartDigital=({productState,addToCart,isLoading})=>{
 const {t}=useTranslation("common");
 const enabled=productState?.product?.status!==0 && (productState?.product?.type==="simple" || Boolean(productState?.selectedVariation));
 return <Btn className="bg-theme btn-md scroll-button" onClick={addToCart} disabled={!enabled} loading={Number(isLoading)}><RiShoppingCartLine className="me-2"/>{t("AddToCart")}</Btn>;
};
export default AddToCartDigital;
