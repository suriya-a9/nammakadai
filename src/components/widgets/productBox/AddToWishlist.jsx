import WishlistContext from "@/context/wishlistContext";
import { Href } from "@/utils/constants";
import { useContext } from "react";
import { RiHeartFill, RiHeartLine } from "react-icons/ri";

const AddToWishlist = ({ productObj, customClass }) => {
  const { addToWishlist, isWishlisted } = useContext(WishlistContext);
  const active = isWishlisted(productObj?.uuid || productObj?.id);
  const handle = (e) => { e?.preventDefault?.(); e?.stopPropagation?.(); void addToWishlist(productObj); };
  return customClass ? (
    <a onClick={handle} href={Href} className={customClass}>{active ? <RiHeartFill className="theme-color" /> : <RiHeartLine />}</a>
  ) : (
    <li title="Wishlist" onClick={handle}><a className="heart-icon">{active ? <RiHeartFill className="theme-color" /> : <RiHeartLine />}</a></li>
  );
};
export default AddToWishlist;
