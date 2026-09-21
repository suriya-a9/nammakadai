import WishlistContext from "@/context/wishlistContext";
import Btn from "@/elements/buttons/Btn";
import { audioFile, Href } from "@/utils/constants";
import { useContext, useEffect, useState } from "react";
import { RiHeartFill, RiHeartLine } from "react-icons/ri";

const WishlistButton = ({ productstate, customClass, hideAction, customAnchor }) => {
  const { addToWishlist, isWishlisted } = useContext(WishlistContext);
  const [audio, setAudio] = useState(null);
  const active = isWishlisted(productstate?.uuid || productstate?.id);
  useEffect(() => { if (typeof window !== "undefined") setAudio(new Audio(audioFile)); }, []);
  const handle = async (e) => { e?.preventDefault?.(); e?.stopPropagation?.(); const ok = await addToWishlist(productstate); if (ok && audio) audio.play().catch(() => {}); };
  if (customClass) return <Btn className={customClass} onClick={handle}>{active ? <RiHeartFill className="theme-color" /> : <RiHeartLine />}</Btn>;
  if (customAnchor) return <a href={Href} title="Add to Wishlist" className={`wishlist-icon ${active ? "theme-color" : ""}`} onClick={handle}><i className={`ri-heart-${active ? "fill" : "line"}`}></i></a>;
  return !hideAction?.includes("wishlist") && <div title="Wishlist" onClick={handle} className="wishlist-icon"><a className="heart-icon">{active ? <RiHeartFill className="theme-color" /> : <RiHeartLine />}</a></div>;
};
export default WishlistButton;
