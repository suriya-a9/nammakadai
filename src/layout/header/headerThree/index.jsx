"use client";
import CategoryContext from "@/context/categoryContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import { Href } from "@/utils/constants";
import { useHeaderScroll } from "@/utils/hooks/HeaderScroll";
import AccountContext from "@/context/accountContext";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { RiHeartLine, RiHome2Line, RiMenuLine, RiUserLine, RiCloseLine } from "react-icons/ri";
import { Col, Container, Row } from "reactstrap";
import HeaderCart from "../widgets/headerCart";
import HeaderLogo from "../widgets/HeaderLogo";
import HeaderSearchbar from "../widgets/headerSearchbar";
import MainHeaderMenu from "../widgets/mainHeaderMenu";
import TopBar from "../widgets/TopBar";
import Link from "next/link";

const HeaderThree = () => {
  const { themeOption, setMobileSideBar, mobileSideBar, setOpenAuthModal } = useContext(ThemeOptionContext);
  const { t } = useTranslation("common");
  const { categoryAPIData } = useContext(CategoryContext);
  const router = useRouter();
  const { accountData } = useContext(AccountContext);
  const [mounted, setMounted] = useState(false);
  const isAuthenticated = Boolean(accountData);
  const UpScroll = useHeaderScroll(false);
  const mainCategories = (categoryAPIData?.data || []).slice(0, 3);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = mobileSideBar ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileSideBar, mounted]);

  const handleProfileClick = (event) => { event?.preventDefault?.(); isAuthenticated ? router.push("/account/dashboard") : setOpenAuthModal(true); };
  const handleWishlistClick = (event) => { event?.preventDefault?.(); isAuthenticated ? router.push("/wishlist") : setOpenAuthModal(true); };
  const closeMenu = () => setMobileSideBar(false);

  const mobileDrawer = mounted ? createPortal(
    <>
      <div className={`nk-store-mobile-drawer ${mobileSideBar ? "show" : ""}`} aria-hidden={!mobileSideBar}>
        <div className="nk-store-mobile-head"><strong>{t("Menu")}</strong><button type="button" onClick={closeMenu} aria-label="Close menu"><RiCloseLine /></button></div>
        <div className="nk-mobile-header-menu">
          <Link className="nk-mobile-header-home" href="/" onClick={closeMenu}><RiHome2Line /><span>{t("Home")}</span></Link>
          <div className="nk-mobile-header-section-title">Categories</div>
          <ul className="nk-mobile-header-categories">
            {(categoryAPIData?.data || []).map((category) => (
              <li key={category.id} className="nk-mobile-header-category">
                <Link href={`/category/${category.slug}`} onClick={closeMenu}>{category.name}</Link>
                {category.subcategories?.length > 0 && <ul className="nk-mobile-header-subcategories">{category.subcategories.map((subcategory) => <li key={subcategory.id}><Link href={`/category/${subcategory.slug}`} onClick={closeMenu}>{subcategory.name}</Link></li>)}</ul>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {mobileSideBar && <button type="button" className="nk-store-mobile-backdrop" onClick={closeMenu} aria-label="Close menu" />}
    </>, document.body) : null;

  return <>
    <header className={`header-style-1 ${themeOption?.header?.sticky_header_enable && UpScroll ? "sticky fixed" : ""}`}>
      {themeOption?.header?.page_top_bar_enable && <TopBar />}
      <div className="bg-light-xl"><Container><Row><Col sm="12"><div className="main-menu">
        <div className="menu-left">
          <button type="button" className="toggle-nav nk-hamburger-button" onClick={() => setMobileSideBar(true)} aria-label="Open menu"><RiMenuLine className="sidebar-bar" /></button>
          <div className="brand-logo me-lg-4 me-0"><HeaderLogo /></div>
          <nav className="navbar navbar-expand-sm navbar-light pe-0 header-category-nav"><div className="collapse navbar-collapse show"><ul className="navbar-nav category-nav me-auto pt-0">{mainCategories.map(category => <li key={category.id} className="nav-item header-category-item"><Link className="nav-link" href={`/category/${category.slug}`}>{category.name}</Link>{category.subcategories?.length > 0 && <ul className="header-category-dropdown">{category.subcategories.map(sub => <li key={sub.id}><Link href={`/category/${sub.slug}`}>{sub.name}</Link></li>)}</ul>}</li>)}</ul></div></nav>
        </div>
        <div className="menu-right pull-right"><div><div className="icon-nav"><ul>
          <li className="onhover-div"><HeaderSearchbar /></li>
          <li className="onhover-div"><Link href={isAuthenticated ? "/wishlist" : Href} onClick={handleWishlistClick}><RiHeartLine /></Link></li>
          <li className="onhover-div"><HeaderCart /></li>
          <li className="onhover-div"><Link href={isAuthenticated ? "/account/dashboard" : Href} onClick={handleProfileClick}><RiUserLine /></Link></li>
        </ul></div></div></div>
      </div></Col></Row></Container></div>
      <div className="border-top-cls d-none d-xl-block"><Container><div className="classic-header main-navbar"><div id="mainnav"><div className="header-nav-middle"><div className="main-nav navbar navbar-expand-xl navbar-light navbar-sticky"><div className="offcanvas-body"><MainHeaderMenu /></div></div></div></div></div></Container></div>
    </header>
    {mobileDrawer}
  </>;
};
export default HeaderThree;
