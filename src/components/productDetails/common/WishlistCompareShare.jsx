import ThemeOptionContext from "@/context/themeOptionsContext";
import { audioFile } from "@/utils/constants";
import Cookies from "js-cookie";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiHeartFill, RiHeartLine, RiRefreshLine, RiShareLine } from "react-icons/ri";
import ShareModal from "./ShareModal";
import { useRouter } from "next/navigation";

const WishlistCompareShare = ({ productState }) => {
  const [productWishlist, setProductWishlist] = useState("");
  const [addToWishlistAudio, setAddToWishlistAudio] = useState(null);
  const { t } = useTranslation("common");
  const { setOpenAuthModal } = useContext(ThemeOptionContext);
  const [modal, setModal] = useState(false);
  const router = useRouter();
  const handelWishlist = () => {
    if (Cookies.get("uat")) {
      addToWishlistAudio.play();
      setProductWishlist((prev) => !prev);
      router.push("/wishlist");
    } else {
      setOpenAuthModal(true);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAddToWishlistAudio(new Audio(audioFile));
    }
  }, []);

  useEffect(() => {
    setProductWishlist(productState?.product?.is_wishlist);
  }, [productState]);

  const addToCompare = () => {
    if (!Cookies.get("uat")) {
      setOpenAuthModal(true);
    } else {
      // Put your logic here
    }
  };

  return (
    <>
      <div className="buy-box compare-box">
        <a onClick={handelWishlist}>
          {productWishlist ? <RiHeartFill /> : <RiHeartLine />}
          <span>{t("AddToWishlist")}</span>
        </a>
        <a onClick={addToCompare}>
          <RiRefreshLine />
          <span>{t("AddToCompare")}</span>
        </a>
        {productState?.product?.social_share ? (
          <a onClick={() => setModal(true)}>
            <RiShareLine />
            <span>{t("Share")}</span>
          </a>
        ) : null}
      </div>
      <ShareModal productState={productState} modal={modal} setModal={setModal} />
    </>
  );
};

export default WishlistCompareShare;
