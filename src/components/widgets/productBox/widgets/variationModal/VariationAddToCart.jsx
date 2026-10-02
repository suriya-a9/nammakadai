import CartContext from "@/context/cartContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import Btn from "@/elements/buttons/Btn";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { RiShoppingCartLine } from "react-icons/ri";

const VariationAddToCart = ({ cloneVariation, setVariationModal }) => {
  const { cartCanvas, setCartCanvas } = useContext(ThemeOptionContext);
  const { t } = useTranslation("common");
  const { handleIncDec, isLoading } = useContext(CartContext);
  const productInStock = true;
  const router = useRouter();

  const addToCart = (allProduct) => {
    setVariationModal(false);
    setCartCanvas(true);
    handleIncDec(cloneVariation?.productQty, cloneVariation?.product, false, false, false, cloneVariation);
  };
  const buyNow = () => {
    handleIncDec(cloneVariation?.productQty, cloneVariation?.product, false, false, false, cloneVariation);
    router.push(`/checkout`);
  };

  return (
    <div className="product-buy-btn-group">
      <Btn className="btn-animation btn-solid hover-solid scroll-button buy-button" disabled={cloneVariation?.product?.status === 0} onClick={addToCart} loading={isLoading}>
        <RiShoppingCartLine className="me-2" />
        <span>{t("AddToCart")}</span>
      </Btn>
      <Btn className="btn-solid buy-button" onClick={() => buyNow(cloneVariation)} disabled={cloneVariation?.product?.status === 0} loading={Number(isLoading)}>
        {t("BuyNow")}
      </Btn>
    </div>
  );
};
export default VariationAddToCart;
