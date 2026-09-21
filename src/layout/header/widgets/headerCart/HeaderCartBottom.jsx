import { useContext, useState } from "react";
import CartContext from "@/context/cartContext";
import { Href } from "@/utils/constants";
import { useTranslation } from "react-i18next";
import { RiShoppingCartLine } from "react-icons/ri";
import CartVariationModal from "./CartVariationModal";
import SelectedCart from "./SelectedCart";

const HeaderCartBottom = ({ modal, setModal }) => {
  const [selectedVariation, setSelectedVariation] = useState("");
  const { t } = useTranslation("common");
  const { cartProducts, clearCart, getCartLoading, cartSyncError, refetch } = useContext(CartContext);

  return (
    <>
      {getCartLoading && <div className="p-3">{cartSyncError ? <><p>{cartSyncError}</p><button type="button" onClick={refetch}>Retry cart sync</button></> : "Loading your cart…"}</div>}
      {!getCartLoading && cartProducts?.length > 0 && (
        <>
          <div className="sidebar-title">
            <a href={Href} onClick={clearCart}>
              {t("ClearCart")}
            </a>
          </div>
          <SelectedCart setSelectedVariation={setSelectedVariation} setModal={setModal} modal={modal} />
        </>
      )}
      <CartVariationModal modal={modal} setModal={setModal} selectedVariation={selectedVariation} />
      {!getCartLoading && !cartProducts?.length && (
        <div className="cart_media empty-cart">
          <ul className="empty-cart-box">
            <div>
              <div className="icon">
                <RiShoppingCartLine />
              </div>
              <h5>{t("EmptyCartDescription")}</h5>
            </div>
          </ul>
        </div>
      )}
    </>
  );
};

export default HeaderCartBottom;
