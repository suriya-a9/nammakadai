import CartContext from "@/context/cartContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import React, { useContext } from "react";
import { RiShoppingCartLine } from "react-icons/ri";
import HeaderCartData from "./HeaderCartData";

const HeaderCart = () => {
  const { setCartCanvas } = useContext(ThemeOptionContext);
  const { cartProducts } = useContext(CartContext);
  return (
    <>
      <RiShoppingCartLine onClick={() => setCartCanvas(true)} />
      {cartProducts?.length > 0 && <span className="cart_qty_cls ">{cartProducts?.length}</span>}
      <HeaderCartData />
    </>
  );
};

export default HeaderCart;
