import { placeHolderImage } from "@/components/widgets/Placeholder";
import CartContext from "@/context/cartContext";
import SettingContext from "@/context/settingContext";
import Image from "next/image";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";

const SidebarProduct = ({ values, quote }) => {
  const { t } = useTranslation("common");
  const { cartProducts } = useContext(CartContext);
  const { convertCurrency } = useContext(SettingContext);
  return (
    <div className="checkout-details">
      <div className="order-box">
        <div className="title-box">
          <h4>{t("SummaryOrder")}</h4>
          <p>{t("SummaryOrderDescription")}</p>
        </div>
        <ul className="qty">
          {cartProducts?.map((item, i) => {
            const verified = quote?.items?.find(row => row.product_id === item.product_id);
            const actualPrice = verified ? verified.unit_price : Number(item?.variation?.sale_price ?? item?.product?.sale_price ?? 0);
            return <li key={i}>
              {item && (
                <div className="cart-image">
                  <Image src={item?.variation && item?.variation?.variation_image ? item?.variation?.variation_image?.original_url : item?.product?.product_thumbnail ? item?.product?.product_thumbnail?.original_url : placeHolderImage} className="img-fluid" alt={item?.product?.name || "product"} width={70} height={70} />
                </div>
              )}
              <div className="cart-content">
                <div>
                  <h4>{item?.variation ? item?.variation?.name : item?.product?.name}</h4>
                  <h5 className="text-theme">
                    {convertCurrency(actualPrice)} x {item.quantity}
                  </h5>
                </div>
                <span className="text-theme">{convertCurrency(actualPrice * item.quantity)}</span>
              </div>
            </li>;
          })}
        </ul>
      </div>
    </div>
  );
};

export default SidebarProduct;
