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
  const { cartProducts, getCartLoading, cartSyncError, refetch } = useContext(CartContext);
  const { isLoading } = useContext(ThemeOptionContext);

  if (isLoading) return <Loader />;
  return (
    <>
      <Breadcrumbs title={"Cart"} subNavigation={[{ name: "Cart" }]} />
      <WrapperComponent classes={{ sectionClass: "cart-section section-b-space", fluidClass: "container" }} noRowCol={true}>
        {cartSyncError && <div className="alert alert-danger" role="alert">{cartSyncError} <button type="button" className="btn btn-sm btn-light ms-2" onClick={refetch}>Retry cart sync</button></div>}
        {getCartLoading ? <div className="py-5 text-center">Loading your cart…</div> : <ShowCartData />}
        {cartProducts.length > 0 && <CartButtons />}
      </WrapperComponent>
    </>
  );
};

export default CartContent;
