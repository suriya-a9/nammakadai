"use client";

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import AccountContext from "@/context/accountContext";
import CartContext from ".";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";

const STORAGE_KEY = "nammakadai_cart_v1";
const MERGE_KEY = "nammakadai_guest_cart_merge_id";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const validItems = (items) => (Array.isArray(items) ? items : [])
  .filter((item) => UUID_PATTERN.test(String(item?.product_id || "")) && Number.isSafeInteger(Number(item.quantity)) && Number(item.quantity) > 0)
  .map((item) => ({ ...item, quantity: Math.min(100, Number(item.quantity)) }));
const lineTotal = (product, quantity) => Math.round(Number(product?.sale_price ?? product?.price ?? 0) * quantity * 100) / 100;
const sameItems = (items) => items.map((item) => ({ product_id: item.product_id, quantity: item.quantity }));

const CartProvider = ({ children }) => {
  const { accountData, authLoading } = useContext(AccountContext);
  const [cartProducts, updateCartProducts] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [ready, setReady] = useState(false);
  const [cartSyncError, setCartSyncError] = useState("");
  const [variationModal, setVariationModal] = useState("");
  const [cartToggle, setCartToggle] = useState(false);
  const [getCardData, setGetCardData] = useState(null);
  const itemsRef = useRef([]);
  const scopeRef = useRef(null);
  const readyRef = useRef(false);
  const mutationRef = useRef(Promise.resolve());
  const revisionRef = useRef(0);

  const apply = useCallback((items) => {
    itemsRef.current = items;
    updateCartProducts(items);
  }, []);

  const readGuest = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem("cart") || "null");
      return validItems(Array.isArray(saved) ? saved : saved?.items);
    } catch { return []; }
  }, []);

  const storeGuest = useCallback((items) => {
    if (items.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
      localStorage.setItem(MERGE_KEY, crypto.randomUUID());
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("cart");
      localStorage.removeItem(MERGE_KEY);
    }
  }, []);

  const api = useCallback(async (method, payload, customerId, query = "") => {
    const response = await fetch(`/api/cart${query}`, {
      method, credentials: "same-origin", cache: "no-store",
      headers: { "Content-Type": "application/json", "x-cart-customer": customerId },
      ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Couldn't save your cart. Please try again.");
    return data.data || [];
  }, []);

  // Guest carts are browser-local. Once authenticated, the server becomes the source of truth.
  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => {
    if (!hydrated || authLoading) return;
    const customerId = accountData?.uuid || accountData?.id || null;
    if (scopeRef.current === customerId && readyRef.current) return;
    let cancelled = false;
    scopeRef.current = customerId || "guest";
    readyRef.current = false;
    setReady(false);
    setCartSyncError("");
    ++revisionRef.current;

    if (!customerId) {
      apply(readGuest());
      readyRef.current = true;
      setReady(true);
      return;
    }

    (async () => {
      try {
        const guest = readGuest();
        const pendingMerge = guest.length > 0;
        let mergeId = localStorage.getItem(MERGE_KEY);
        if (pendingMerge && !mergeId) {
          mergeId = crypto.randomUUID();
          localStorage.setItem(MERGE_KEY, mergeId);
        }
        const items = pendingMerge
          ? await api("POST", { action: "merge", items: sameItems(guest), merge_id: mergeId }, customerId)
          : await api("GET", undefined, customerId);
        if (cancelled || scopeRef.current !== customerId) return;
        // Clear guest data only after the server confirms a successful merge.
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("cart");
        localStorage.removeItem(MERGE_KEY);
        apply(items);
        readyRef.current = true;
        setReady(true);
      } catch (error) {
        if (!cancelled && scopeRef.current === customerId) {
          setCartSyncError(error.message);
          ToastNotification("error", error.message);
          // Never silently display an empty database cart as a successful sync.
          setReady(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [hydrated, authLoading, accountData?.uuid, accountData?.id, apply, api, readGuest]);

  const refetch = useCallback(async () => {
    const customerId = scopeRef.current;
    if (!customerId || customerId === "guest") {
      if (customerId === "guest") apply(readGuest());
      return;
    }
    await mutationRef.current;
    if (scopeRef.current !== customerId) return;
    const revision = revisionRef.current;
    try {
      // A failed login-time merge must be retried, not replaced with a plain GET.
      const guest = readGuest();
      let mergeId = localStorage.getItem(MERGE_KEY);
      if (guest.length && !mergeId) {
        mergeId = crypto.randomUUID();
        localStorage.setItem(MERGE_KEY, mergeId);
      }
      const items = guest.length
        ? await api("POST", { action: "merge", items: sameItems(guest), merge_id: mergeId }, customerId)
        : await api("GET", undefined, customerId);
      if (scopeRef.current === customerId && revision === revisionRef.current) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("cart");
        localStorage.removeItem(MERGE_KEY);
        apply(items);
        setCartSyncError("");
        setReady(true);
        readyRef.current = true;
      }
    } catch (error) {
      if (scopeRef.current === customerId) setCartSyncError(error.message);
    }
  }, [api, apply, readGuest]);

  // Refresh after returning from another device/tab; do not overwrite pending local changes.
  useEffect(() => {
    if (!ready || scopeRef.current === "guest") return;
    const onFocus = () => { void refetch(); };
    window.addEventListener("focus", onFocus);
    const onVisibility = () => { if (!document.hidden) onFocus(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { window.removeEventListener("focus", onFocus); document.removeEventListener("visibilitychange", onVisibility); };
  }, [ready, refetch]);

  const commit = useCallback((items, method, body, query = "") => {
    if (!readyRef.current) return false;
    const customerId = scopeRef.current;
    apply(items);
    if (customerId === "guest") { storeGuest(items); return true; }
    if (!customerId) return false;
    const revision = ++revisionRef.current;
    // Serialize mutations so quick +/-/remove clicks reach PostgreSQL in the same order.
    mutationRef.current = mutationRef.current.catch(() => {}).then(async () => {
      if (scopeRef.current !== customerId) return;
      try {
        const fromServer = await api(method, body, customerId, query);
        if (scopeRef.current === customerId && revision === revisionRef.current) {
          apply(fromServer);
          setCartSyncError("");
        }
      } catch (error) {
        if (scopeRef.current === customerId) {
          setCartSyncError(error.message);
          ToastNotification("error", error.message);
          // Restore authoritative server state after all queued mutations finish.
          const currentRevision = revisionRef.current;
          try {
            const fromServer = await api("GET", undefined, customerId);
            if (scopeRef.current === customerId && currentRevision === revisionRef.current) { apply(fromServer); setCartSyncError(""); }
          } catch { /* Keep the visible error; retry on next focus. */ }
        }
      }
    });
    return true;
  }, [api, apply, storeGuest]);

  const setCartProducts = useCallback((updater) => {
    if (!readyRef.current) return;
    const items = validItems(typeof updater === "function" ? updater(itemsRef.current) : updater);
    commit(items, "PUT", { items: sameItems(items) });
  }, [commit]);

  const removeCart = useCallback((id) => {
    if (!readyRef.current) return;
    const item = itemsRef.current.find((row) => row.product_id === id || row.variation_id === id);
    if (!item) return;
    commit(itemsRef.current.filter((row) => row.product_id !== item.product_id), "DELETE", undefined,
      `?product_id=${encodeURIComponent(item.product_id)}`);
  }, [commit]);

  const clearCart = useCallback((options) => {
    if (!readyRef.current) return;
    if (options?.skipRemote === true) {
      ++revisionRef.current;
      apply([]);
      return;
    }
    commit([], "DELETE");
  }, [apply, commit]);

  const handleIncDec = useCallback((delta, productObj, currentQty, setIsProductQty, isOpenFun, variationState) => {
    if (!readyRef.current) return false;
    const id = productObj?.id || productObj?.uuid;
    const change = Number(delta);
    if (!id || !Number.isSafeInteger(change) || change === 0) return false;
    const existing = itemsRef.current.find((item) => item.product_id === id);
    const quantity = (existing?.quantity || 0) + change;
    const stock = Number(productObj?.quantity ?? existing?.product?.quantity ?? 0);
    if (quantity > Math.min(stock, 100)) { ToastNotification("error", `Only ${Math.min(stock, 100)} items in stock`); return false; }
    const product = productObj || existing?.product;
    const next = quantity <= 0
      ? itemsRef.current.filter((item) => item.product_id !== id)
      : existing
        ? itemsRef.current.map((item) => item.product_id === id ? { ...item, product, quantity, sub_total: lineTotal(product, quantity) } : item)
        : [...itemsRef.current, { id: null, product_id: id, variation_id: null, variation: null,
          product, quantity, sub_total: lineTotal(product, quantity) }];
    if (!commit(next, "POST", { action: "change", product_id: id, delta: change })) return false;
    if (typeof setIsProductQty === "function") setIsProductQty(Math.max(0, quantity));
    if (typeof isOpenFun === "function") isOpenFun(true);
    return true;
  }, [commit]);

  const cartTotal = useMemo(() => cartProducts.reduce((sum, item) => sum + Number(item.sub_total || 0), 0), [cartProducts]);
  const getTotal = useCallback((items) => (items || []).reduce((sum, item) => sum + Number(item.sub_total || 0), 0), []);
  const waitForCartSync = useCallback(async () => { await mutationRef.current; }, []);

  return <CartContext.Provider value={{ cartProducts, setCartProducts, cartTotal, getCardData, setGetCardData,
    setCartTotal: () => {}, removeCart, clearCart, getTotal, handleIncDec, cartToggle, cartToggleValue: setCartToggle,
    variationModal, setVariationModal, refetch, waitForCartSync, cartSyncError, isLoading: false,
    getCartLoading: authLoading || !ready, replaceCartLoader: false, replaceCart: () => {} }}>
    {children}
  </CartContext.Provider>;
};

export default CartProvider;
