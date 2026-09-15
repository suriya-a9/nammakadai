"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  RiAddLine,
  RiAppsLine,
  RiArrowDownSLine,
  RiFolderLine,
  RiFullscreenExitLine,
  RiFullscreenFill,
  RiGlobalLine,
  RiHomeLine,
  RiLogoutBoxLine,
  RiMoonLine,
  RiNotification3Line,
  RiSearchLine,
  RiStore3Line,
  RiSubtractLine,
  RiSunLine,
} from "react-icons/ri";
import { Container } from "reactstrap";

const LOGO = "/assets/images/icon/logo/nammakadai/Namma%20Kadai%20Logo.png";

export default function AdminThemeShell({ admin, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(pathname.startsWith("/admin/category") || pathname.startsWith("/admin/product"));
  const [darkMode, setDarkMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark-only", darkMode);
    return () => document.body.classList.remove("dark-only");
  }, [darkMode]);

  useEffect(() => {
    setMobileOpen(false);
    if (pathname.startsWith("/admin/category") || pathname.startsWith("/admin/product")) setProductsOpen(true);
  }, [pathname]);

  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 991) {
      setMobileOpen((value) => !value);
    } else {
      setCollapsed((value) => !value);
    }
  };

  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
        setIsFullScreen(true);
      } else {
        await document.exitFullscreen?.();
        setIsFullScreen(false);
      }
    } catch {
      setIsFullScreen(Boolean(document.fullscreenElement));
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  const initial = (admin?.name || "A").trim().charAt(0).toUpperCase();
  const dashboardActive = pathname === "/admin";
  const categoryActive = pathname.startsWith("/admin/category");
  const productActive = pathname.startsWith("/admin/product");
  const productsSectionActive = categoryActive || productActive;

  return (
    <div className="page-wrapper compact-wrapper" id="pageWrapper">
      <div className={`page-header ${collapsed ? "close_icon" : ""}`}>
        <div className="header-wrapper m-0">
          <div className="header-logo-wrapper p-0">
            <button type="button" className="toggle-sidebar border-0 bg-transparent" onClick={toggleSidebar} aria-label="Toggle sidebar">
              <RiAppsLine />
            </button>
            <Link href="/admin" className="d-lg-none admin-header-logo">
              <Image src={LOGO} width={36} height={36} alt="NammaKadai" priority />
              <span>NammaKadai</span>
            </Link>
          </div>

          <form className="form-inline search-full admin-search-static" onSubmit={(event) => event.preventDefault()}>
            <div className="w-100 position-relative">
              <div className="search-icon d-md-flex d-none"><RiSearchLine /></div>
              <div className="Typeahead Typeahead--twitterUsers">
                <div className="u-posRelative">
                  <input className="demo-input Typeahead-input form-control-plaintext w-100" type="text" placeholder="Search .." aria-label="Search admin" />
                </div>
              </div>
            </div>
          </form>

          <div className="nav-right pull-right right-header p-0">
            <ul className="nav-menus">
              <li className="d-md-none"><span className="header-search"><RiSearchLine /></span></li>
              <li>
                <Link className="global-box" href="/" target="_blank" title="Open storefront"><RiGlobalLine /></Link>
              </li>
              <li>
                <div className="full-screen-box" onClick={toggleFullScreen} role="button" tabIndex={0} title="Fullscreen">
                  {isFullScreen ? <RiFullscreenExitLine className="header-fullscreen" /> : <RiFullscreenFill className="header-fullscreen" />}
                </div>
              </li>
              <li>
                <div className="notification-box" title="Notifications"><RiNotification3Line /></div>
              </li>
              <li>
                <div className="mode" title="Theme" onClick={() => setDarkMode((value) => !value)} role="button" tabIndex={0}>
                  {darkMode ? <RiSunLine /> : <RiMoonLine />}
                </div>
              </li>
              <li className="profile-nav onhover-dropdown p-0 me-0">
                <div className="media profile-media" onClick={() => setProfileOpen((value) => !value)} role="button" tabIndex={0}>
                  <span className="admin-profile-avatar">{initial}</span>
                  <div className="media-body user-name-hide">
                    <span>{admin?.name || "Admin"}</span>
                    <p className="mb-0 mt-1">Admin <RiArrowDownSLine className="middle" /></p>
                  </div>
                </div>
                <ul className={`profile-dropdown onhover-show-div admin-profile-dropdown ${profileOpen ? "active" : ""}`}>
                  <li>
                    <button type="button" onClick={logout}><RiLogoutBoxLine /><span>Logout</span></button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="page-body-wrapper">
        <div className={`sidebar-wrapper ${collapsed ? "close_icon" : ""} ${mobileOpen ? "admin-mobile-open" : ""}`}>
          <div className="logo-wrapper logo-wrapper-center">
            <Link href="/admin" className="admin-brand-link">
              <Image src={LOGO} width={52} height={52} alt="NammaKadai" priority />
              <span className="admin-brand-name">NammaKadai</span>
            </Link>
            <button type="button" className="toggle-sidebar border-0 bg-transparent text-white" onClick={toggleSidebar} aria-label="Toggle sidebar">
              <RiAppsLine />
            </button>
          </div>

          <nav className="sidebar-main">
            <div id="sidebar-menu">
              <ul className="sidebar-links" id="simple-bar">
                <li className="sidebar-list">
                  <Link href="/admin" className={`sidebar-link sidebar-title link-nav ${dashboardActive ? "active" : ""}`}>
                    <div className="svg-icon"><RiHomeLine /></div>
                    <span>Dashboard</span>
                  </Link>
                </li>

                <li className="sidebar-list">
                  <a
                    href="#"
                    className={`sidebar-link sidebar-title link-nav ${productsSectionActive ? "active" : ""}`}
                    onClick={(event) => { event.preventDefault(); setProductsOpen((value) => !value); }}
                  >
                    <div className="svg-icon"><RiStore3Line /></div>
                    <span>Products</span>
                    {productsOpen ? <RiSubtractLine className="icon-arrow" /> : <RiAddLine className="icon-arrow" />}
                  </a>
                  <ul className={`sidebar-submenu ${productsOpen ? "d-block" : "d-none"}`}>
                    <li className="sidebar-list">
                      <Link href="/admin/product" className={productActive ? "active" : ""}>
                        <div className="svg-icon"><RiStore3Line /></div>
                        <span>Products</span>
                      </Link>
                    </li>
                    <li className="sidebar-list">
                      <Link href="/admin/category" className={categoryActive ? "active" : ""}>
                        <div className="svg-icon"><RiFolderLine /></div>
                        <span>Categories</span>
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="page-body">
          <Container fluid>{children}</Container>
          <Container fluid>
            <footer className="footer">
              <div className="row">
                <div className="col-md-12 footer-copyright text-center">
                  <p className="mb-0">© {new Date().getFullYear()} NammaKadai Admin</p>
                </div>
              </div>
            </footer>
          </Container>
        </div>
      </div>
    </div>
  );
}
