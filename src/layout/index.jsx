"use client";
import AccountProvider from "@/context/accountContext/AccountProvider";
import BlogProvider from "@/context/blogContext/BlogProvider";
import BlogIdsProvider from "@/context/blogIdsContext/BlogIdsProvider";
import BrandProvider from "@/context/brandContext/BrandProvider";
import BrandIdsProvider from "@/context/brandIdsContext/BrandIdsProvider";
import CartProvider from "@/context/cartContext/CartProvider";
import CategoryProvider from "@/context/categoryContext/CategoryProvider";
import CompareProvider from "@/context/compareContext/CompareProvider";
import CurrencyProvider from "@/context/currencyContext/CurrencyProvider";
import ProductProvider from "@/context/productContext/ProductProvider";
import ProductIdsProvider from "@/context/productIdsContext/ProductIdsProvider";
import SettingProvider from "@/context/settingContext/SettingProvider";
import ThemeOptionProvider from "@/context/themeOptionsContext/ThemeOptionProvider";
import WishlistProvider from "@/context/wishlistContext/WishlistProvider";
import { HydrationBoundary, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import SubLayout from "./SubLayout";

const MainLayout = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={children.dehydratedState}>
          <SettingProvider>
            <CompareProvider>
              <CategoryProvider>
                <BlogProvider>
                  <ThemeOptionProvider>
                    <BrandProvider>
                      <CurrencyProvider>
                        <ProductIdsProvider>
                          <AccountProvider>
                            <CartProvider>
                              <WishlistProvider>
                                <BrandIdsProvider>
                                  <BlogIdsProvider>
                                    <ProductProvider>
                                      <SubLayout children={children} />
                                    </ProductProvider>
                                  </BlogIdsProvider>
                                </BrandIdsProvider>
                              </WishlistProvider>
                            </CartProvider>
                          </AccountProvider>
                        </ProductIdsProvider>
                      </CurrencyProvider>
                    </BrandProvider>
                  </ThemeOptionProvider>
                </BlogProvider>
              </CategoryProvider>
            </CompareProvider>
          </SettingProvider>
        </HydrationBoundary>
      </QueryClientProvider>
      <ToastContainer autoClose={2000} theme="colored" />
    </>
  );
};

export default MainLayout;
