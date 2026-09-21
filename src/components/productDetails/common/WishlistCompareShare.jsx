import WishlistContext from "@/context/wishlistContext";
import { audioFile } from "@/utils/constants";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiHeartFill, RiHeartLine, RiShareLine } from "react-icons/ri";
import ShareModal from "./ShareModal";

const WishlistCompareShare = ({ productState }) => {
  const [productWishlist, setProductWishlist] = useState("");
  const [addToWishlistAudio, setAddToWishlistAudio] = useState(null);
  const { t } = useTranslation("common");
  const { addToWishlist, isWishlisted } = useContext(WishlistContext);
  const [modal, setModal] = useState(false);
  const handelWishlist = async () => {
    const ok = await addToWishlist(productState?.product);
    if (ok && addToWishlistAudio) addToWishlistAudio.play().catch(() => {});
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAddToWishlistAudio(new Audio(audioFile));
    }
  }, []);

  useEffect(() => {
    setProductWishlist(isWishlisted(productState?.product?.uuid || productState?.product?.id));
  }, [productState, isWishlisted]);

  return (
    <>
      <div className="buy-box compare-box">
        <a onClick={handelWishlist}>
          {productWishlist ? <RiHeartFill /> : <RiHeartLine />}
          <span>{t("AddToWishlist")}</span>
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
