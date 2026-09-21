"use client";
import AccountContext from "@/context/accountContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";
import React, { useCallback, useContext, useEffect, useState } from "react";
import WishlistContext from ".";

const WishlistProvider = ({ children }) => {
  const { accountData, authLoading } = useContext(AccountContext);
  const { setOpenAuthModal } = useContext(ThemeOptionContext);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [WishlistAPILoading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!accountData) { setWishlistProducts([]); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist", { credentials: "same-origin", cache: "no-store" });
      if (res.status === 401) { setWishlistProducts([]); return; }
      const json = await res.json();
      if (res.ok) setWishlistProducts(json?.data || []);
    } finally { setLoading(false); }
  }, [accountData]);

  useEffect(() => { if (!authLoading) void refetch(); }, [authLoading, refetch]);

  const isWishlisted = useCallback((productId) => wishlistProducts.some((p) => p.id === productId || p.uuid === productId), [wishlistProducts]);

  const addToWishlist = async (productObj) => {
    if (!accountData) {
      setOpenAuthModal(true);
      ToastNotification("error", "Please login to use wishlist");
      return false;
    }
    const productId = productObj?.uuid || productObj?.id;
    if (!productId) return false;
    const alreadyAdded = isWishlisted(productId);
    const res = await fetch(alreadyAdded ? `/api/wishlist/${productId}` : "/api/wishlist", {
      method: alreadyAdded ? "DELETE" : "POST",
      credentials: "same-origin",
      headers: alreadyAdded ? undefined : { "Content-Type": "application/json" },
      body: alreadyAdded ? undefined : JSON.stringify({ product_id: productId }),
    });
    if (res.status === 401) { setOpenAuthModal(true); return false; }
    const json = await res.json();
    if (!res.ok) { ToastNotification("error", json?.message || "Could not update wishlist"); return false; }
    setWishlistProducts(json?.data || []);
    ToastNotification("success", alreadyAdded ? "Removed from wishlist" : "Added to wishlist");
    return true;
  };

  const removeWishlist = async (productId) => {
    if (!accountData) { setOpenAuthModal(true); return false; }
    const res = await fetch(`/api/wishlist/${productId}`, { method: "DELETE", credentials: "same-origin" });
    const json = await res.json();
    if (res.ok) setWishlistProducts(json?.data || []);
    return res.ok;
  };

  return <WishlistContext.Provider value={{ wishlistProducts, WishlistAPILoading, setWishlistProducts, removeWishlist, refetch, addToWishlist, isWishlisted }}>
    {children}
  </WishlistContext.Provider>;
};
export default WishlistProvider;
