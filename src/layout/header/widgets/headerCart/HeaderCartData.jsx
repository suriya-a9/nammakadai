import CartContext from "@/context/cartContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import { Href } from "@/utils/constants";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiCloseFill } from "react-icons/ri";
import HeaderCartBottom from "./HeaderCartBottom";

const HeaderCartData = () => {
  const { themeOption, setCartCanvas, cartCanvas } = useContext(ThemeOptionContext);
  const { cartProducts } = useContext(CartContext);
  const { t } = useTranslation("common");
  const [modal, setModal] = useState(false);
  const [cartStyle, setCartStyle] = useState("");

  useEffect(() => {
    setCartStyle(themeOption?.general?.cart_style);
    const handleResize = () => {
      if (window.innerWidth < 761) {
        setCartStyle("cart_side");
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      setCartStyle(themeOption?.general?.cart_style);
    };
  }, [themeOption]);

  return (
    <>
      <div id="cart_side" className={`${cartCanvas ? "open-side" : ""} ${cartStyle === "cart_mini" ? "show-div shopping-cart" : "add_to_cart right right-cart-box"}`}>
        <a href={Href} className="overlay" onClick={() => setCartCanvas(false)} />
        <div className="cart-inner">
          <div className="cart_top">
            <h3>
              {t("MyCart")} <span>{`(${cartProducts?.length})`}</span>
            </h3>
            <div className="close-cart" onClick={() => setCartCanvas(false)}>
              <a href={Href}>
                <RiCloseFill />
              </a>
            </div>
          </div>
          <HeaderCartBottom modal={modal} setModal={setModal} />
        </div>
      </div>
    </>
  );
};

export default HeaderCartData;
