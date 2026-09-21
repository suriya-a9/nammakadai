import Avatar from "@/components/widgets/Avatar";
import { placeHolderImage } from "@/components/widgets/Placeholder";
import CartContext from "@/context/cartContext";
import ProductIdsContext from "@/context/productIdsContext";
import SettingContext from "@/context/settingContext";
import Btn from "@/elements/buttons/Btn";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Col, Row } from "reactstrap";
import VariantDropDown from "./VariantDropDown";

const ProductBundle = ({ productState, setProductState }) => {
  const [crossSellProduct, setCrossSellProduct] = useState([]);
  const { t } = useTranslation("common");
  const { handleIncDec } = useContext(CartContext);
  const { convertCurrency } = useContext(SettingContext);
  const { filteredProduct } = useContext(ProductIdsContext);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [total, setTotal] = useState(0);

  const onProductCheck = (event) => {
    event.stopPropagation();
    const productId = String(event?.target?.value);
    if (event.target.checked) {
      setSelectedProductIds((prev) => [...prev, productId]);
    } else {
      setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
    }
  };
  useEffect(() => {
    const selected = filteredProduct?.filter((elem) => selectedProductIds?.includes(elem?.id));
    setSelectedProducts(selected);
    const newTotal = selected.reduce((sum, item) => sum + item.sale_price, 0);
    setTotal(newTotal);
  }, [selectedProductIds, filteredProduct]);

  useEffect(() => {
    productState?.product?.cross_sell_products && setCrossSellProduct(filteredProduct?.filter((elem) =>  productState?.product?.cross_sell_products?.includes(elem?.id)));
  }, [productState, filteredProduct]);
  
  const getSelectedVariant = (data) => {
    console.log("i am selectes", data);
  }
  const addToCart = (qty, products) => {
    // Use the same guest/account cart flow as every other Add to Cart button.
    // Do not post to the removed mock cart API or use demo numeric product IDs.
    products.forEach((product) => handleIncDec(qty, product));
  };

  return (
    <div className="bordered-box pt-2">
      <h4 className="sub-title">{t("FrequentlyBoughtTogether")}</h4>
      <div className="bundle">
        <Row className="bundle-image-box g-3">
          {crossSellProduct.map((elem, i) => (
            <Col xl="6" lg="12" sm="6" key={i}>
              <div className="bundle-box">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input checkbox_animated" id={`crosssell-${elem?.id}`} value={elem?.id} onChange={(e) => onProductCheck(e)} />
                </div>
                <div className="bundle-image">
                  <Link href={`/product/${elem?.slug}`}>
                    <Avatar customClass={"img-fluid"} data={elem?.product_thumbnail} name={elem?.name} placeHolder={placeHolderImage} height={70} width={70} />
                  </Link>
                </div>
                <div className="bundle-content">
                  <div>
                    <Link href={`/product/${elem?.slug}`}>
                      <h4>{elem?.name}</h4>
                    </Link>
                  </div>
                 
                  {(elem.variations && elem.variations.length > 0 && elem.attributes.length > 0)?
                    <VariantDropDown product={elem} selectedOption={getSelectedVariant}></VariantDropDown>
                  :''}
                  <h3>{convertCurrency(elem?.sale_price)}</h3>
                </div>
              </div>
            </Col>
          ))}
        </Row>
        <h4 className="bundle-title">{t("ProductSelectedFor")}</h4>
        <h4 className="theme-color total-price">{convertCurrency(total)}</h4>
        <Btn loading={false} size="xs" disabled={!total} className=" btn-solid bundle-btn mt-0 mt-sm-2 " onClick={(e) => addToCart(1, selectedProducts)}>
          {t("BuyThisBundle")}
        </Btn>
      </div>
    </div>
  );
};

export default ProductBundle;
