import CartContext from "@/context/cartContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import Btn from "@/elements/buttons/Btn";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";

const CompareAction = ({ product }) => {
  const { t } = useTranslation("common");
  const { setCartCanvas } = useContext(ThemeOptionContext);
  const { handleIncDec } = useContext(CartContext);

  const addToCart = () => {
    setCartCanvas(true);
    handleIncDec(1, product);
  };
  return (
    <div className="btn-part">
      <Btn className=" btn-solid" onClick={addToCart}>
        {t("AddToCart")}
      </Btn>
    </div>
  );
};

export default CompareAction;
