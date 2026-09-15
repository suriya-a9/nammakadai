import ThemeOptionContext from "@/context/themeOptionsContext";
import Btn from "@/elements/buttons/Btn";
import { audioFile, Href } from "@/utils/constants";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { RiHeartFill, RiHeartLine } from "react-icons/ri";

const WishlistButton = ({ productstate, customClass, hideAction, customAnchor }) => {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [productWishlist, setProductWishlist] = useState(productstate?.is_wishlist);
  const [addToWishlistAudio, setAddToWishlistAudio] = useState(new Audio(audioFile));
  const router = useRouter();
  const { setOpenAuthModal } = useContext(ThemeOptionContext);

  const handelWishlist = (productstate) => {
    if (Cookies.get("uat")) {
      addToWishlistAudio.play();
      router.push("/wishlist");
      // Put your logic here
    } else {
      setOpenAuthModal(true);
    }
  };

  const handleCloseModal = () => {
    setLoginModalOpen(false);
  };
  return (
    <>
      {customClass ? (
        <Btn className={customClass ? customClass : ""} onClick={() => handelWishlist(productstate)}>
          {productWishlist ? <RiHeartFill className="theme-color" /> : <RiHeartLine />}
        </Btn>
      ) : customAnchor ? (
        <a href={Href} title="Add to Wishlist" className={`wishlist-icon ${productWishlist ? "theme-color" : ""}`} onClick={() => handelWishlist(productstate)}>
          <i className={`ri-heart-${productWishlist ? "fill" : "line"}`}></i>
        </a>
      ) : (
        !hideAction?.includes("wishlist") && (
          <div title="Wishlist" onClick={() => handelWishlist(productstate)} className="wishlist-icon">
            <a className={"heart-icon"}>{productWishlist ? <RiHeartFill className="theme-color" /> : <RiHeartLine />}</a>
          </div>
        )
      )}
    </>
  );
};

export default WishlistButton;
