"use client";
import CartContext from "@/context/cartContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import Loader from "@/layout/loader";
import Breadcrumbs from "@/utils/commonComponents/breadcrumb";
import { useContext } from "react";
import WrapperComponent from "../widgets/WrapperComponent";
import CartButtons from "./CartButtons";
import ShowCartData from "./ShowCartData";

const CartContent = () => {
  const { cartProducts, getCartLoading } = useContext(CartContext);
  const { isLoading } = useContext(ThemeOptionContext);

  if (isLoading) return <Loader />;
  return (
    <>
      <Breadcrumbs title={"Cart"} subNavigation={[{ name: "Cart" }]} />
      <WrapperComponent classes={{ sectionClass: "cart-section section-b-space", fluidClass: "container" }} noRowCol={true}>
        <ShowCartData />
        {cartProducts.length > 0 && <CartButtons />}
      </WrapperComponent>
    </>
  );
};

export default CartContent;
