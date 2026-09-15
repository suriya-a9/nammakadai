import React, { useEffect, useState } from "react";
import ProductBox6 from "./ProductBox6";
import ProductBoxHorizontal from "./ProductBoxHorizontal";

const ProductBox = ({ style = "vertical", product, boxStyle }) => {
  const [productState, setProductState] = useState({
    product,
    attributeValues: [],
    productQty: 1,
    selectedVariation: "",
    variantIds: [],
  });

  useEffect(() => {
    if (product) {
      setProductState((prev) => ({ ...prev, product }));
    }
  }, [product]);

  if (style === "horizontal") {
    return <ProductBoxHorizontal productState={productState} style={boxStyle} />;
  }

  return <ProductBox6 productState={productState} />;
};

export default ProductBox;
