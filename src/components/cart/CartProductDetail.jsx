import SettingContext from "@/context/settingContext";
import Link from "next/link";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import Avatar from "../widgets/Avatar";
import { placeHolderImage } from "../widgets/Placeholder";

const CartProductDetail = ({ elem }) => {
  const { t } = useTranslation("common");
  const { convertCurrency } = useContext(SettingContext);
  return (
    <td>
      <Link href={`/product/${elem?.product?.slug}`} className="product-image">
        <Avatar customClass="product-image" customImageClass={"img-fluid"} data={elem?.variation?.variation_image ?? elem?.product?.product_thumbnail} placeHolder={placeHolderImage} name={elem?.product?.name} />
      </Link>
    </td>
  );
};

export default CartProductDetail;
