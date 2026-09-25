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
  RiUser3Line,
  RiFullscreenExitLine,
  RiFullscreenFill,
  RiGlobalLine,
  RiHomeLine,
  RiLogoutBoxLine,
  RiNotification3Line,
  RiSearchLine,
  RiStore3Line,
  RiSubtractLine,
} from "react-icons/ri";
import { Container } from "reactstrap";

const LOGO = "/assets/images/icon/logo/nammakadai/Namma%20Kadai%20Logo.png";

export default function AdminThemeShell({ admin, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(pathname.startsWith("/admin/category") || pathname.startsWith("/admin/product") || pathname.startsWith("/admin/attributes"));
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [orderNotifications, setOrderNotifications] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [seenOrders, setSeenOrders] = useState([]);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminSearchResults, setAdminSearchResults] = useState([]);
  const [adminSearching, setAdminSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    if (pathname.startsWith("/admin/category") || pathname.startsWith("/admin/product") || pathname.startsWith("/admin/attributes")) setProductsOpen(true);
  }, [pathname]);

  useEffect(() => {
    try { setSeenOrders(JSON.parse(localStorage.getItem("nk_admin_seen_orders") || "[]")); } catch {}
    let alive = true;
    const loadNotifications = async () => {
      try {
        const [orderResponse, productResponse] = await Promise.all([
          fetch("/api/admin/orders", { cache: "no-store" }),
          fetch("/api/product?paginate=500&status=1", { cache: "no-store" }),
        ]);
        const [orderResult, productResult] = await Promise.all([orderResponse.json(), productResponse.json()]);
        if (alive && orderResponse.ok) setOrderNotifications((orderResult.data || []).slice(0, 8));
        if (alive && productResponse.ok) setLowStockProducts((productResult.data || []).filter((product) => Number(product.quantity) < 10).slice(0, 12));
      } catch {}
    };
    loadNotifications();
    const timer = setInterval(loadNotifications, 20000);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  useEffect(() => {
    const q = adminSearch.trim();
    if (q.length < 2) { setAdminSearchResults([]); setSearchOpen(false); return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setAdminSearching(true);
      try {
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`, { cache: "no-store", signal: controller.signal });
        const result = await response.json();
        if (response.ok) { setAdminSearchResults(result.data || []); setSearchOpen(true); }
      } catch (error) { if (error?.name !== "AbortError") setAdminSearchResults([]); }
      finally { setAdminSearching(false); }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [adminSearch]);

  const submitAdminSearch = (event) => {
    event.preventDefault();
    if (adminSearchResults[0]) { router.push(adminSearchResults[0].href); setSearchOpen(false); }
  };

  const unreadOrders = orderNotifications.filter((order) => !seenOrders.includes(order.uuid));
  const openNotifications = () => {
    setNotificationOpen((value) => !value);
    if (!notificationOpen && orderNotifications.length) {
      const ids = [...new Set([...seenOrders, ...orderNotifications.map((order) => order.uuid)])].slice(-200);
      setSeenOrders(ids);
      localStorage.setItem("nk_admin_seen_orders", JSON.stringify(ids));
    }
  };

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
  const productsSectionActive = categoryActive || productActive || pathname.startsWith("/admin/attributes");

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

          <form className="form-inline search-full admin-search-static" onSubmit={submitAdminSearch}>
            <div className="w-100 position-relative admin-global-search">
              <div className="search-icon d-md-flex d-none"><RiSearchLine /></div>
              <div className="Typeahead Typeahead--twitterUsers">
                <div className="u-posRelative">
                  <input className="demo-input Typeahead-input form-control-plaintext w-100" type="search" value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} onFocus={() => adminSearch.trim().length >= 2 && setSearchOpen(true)} placeholder="Search orders, customers, products..." aria-label="Search admin" autoComplete="off" />
                </div>
              </div>
              {searchOpen && (
                <div className="admin-search-results">
                  {adminSearching ? <div className="admin-search-state">Searching…</div> : adminSearchResults.length ? adminSearchResults.map((item) => (
                    <button type="button" key={`${item.type}-${item.id}`} className="admin-search-result" onClick={() => { router.push(item.href); setSearchOpen(false); }}>
                      <span className="admin-search-result-type">{item.type}</span>
                      <span className="admin-search-result-copy"><strong>{item.title}</strong><small>{item.subtitle}</small></span>
                    </button>
                  )) : <div className="admin-search-state">No results found.</div>}
                </div>
              )}
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
              <li className="admin-notification-wrap">
                <button type="button" className="notification-box admin-notification-button" title="Order notifications" onClick={openNotifications}>
                  <RiNotification3Line />
                  {(unreadOrders.length + lowStockProducts.length) > 0 && <span className="admin-notification-badge">{(unreadOrders.length + lowStockProducts.length) > 9 ? "9+" : unreadOrders.length + lowStockProducts.length}</span>}
                </button>
                <div className={`admin-notification-dropdown ${notificationOpen ? "show" : ""}`}>
                  <div className="admin-notification-head"><div><strong>Notifications</strong><small>Orders & stock alerts</small></div>{unreadOrders.length > 0 && <span>{unreadOrders.length} new</span>}</div>
                  <div className="admin-notification-list">
                    {orderNotifications.length === 0 ? <div className="admin-notification-empty">No order notifications yet.</div> : orderNotifications.map((order) => (
                      <Link href="/admin/orders" className="admin-notification-item" key={order.uuid} onClick={() => setNotificationOpen(false)}>
                        <span className="admin-notification-icon"><RiFolderLine /></span>
                        <span className="admin-notification-copy"><strong>New order · {order.number}</strong><small>{order.name} · ₹{Number(order.total).toFixed(2)}</small><time>{new Date(order.date).toLocaleString()}</time></span>
                      </Link>
                    ))}
                    {lowStockProducts.length > 0 && <div className="admin-stock-alert-heading">Low stock alerts</div>}
                    {lowStockProducts.map((product) => (
                      <Link href="/admin/product" className="admin-notification-item admin-low-stock-item" key={`stock-${product.uuid || product.id}`} onClick={() => setNotificationOpen(false)}>
                        <span className="admin-notification-icon"><RiStore3Line /></span>
                        <span className="admin-notification-copy"><strong>{product.name}</strong><small>{Number(product.quantity) <= 0 ? "Out of stock" : `Only ${product.quantity} items remaining`}</small></span>
                      </Link>
                    ))}
                  </div>
                  <Link href="/admin/product" className="admin-notification-footer" onClick={() => setNotificationOpen(false)}>Manage inventory</Link>
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
                  <Link href="/admin/orders" className={`sidebar-link sidebar-title link-nav ${pathname.startsWith("/admin/orders") ? "active" : ""}`}>
                    <div className="svg-icon"><RiFolderLine /></div><span>Customer Orders</span>
                  </Link>
                </li>
                <li className="sidebar-list">
                  <Link href="/admin/customers" className={`sidebar-link sidebar-title link-nav ${pathname.startsWith("/admin/customers") ? "active" : ""}`}>
                    <div className="svg-icon"><RiUser3Line /></div><span>Customers</span>
                  </Link>
                </li>
                <li className="sidebar-list"><Link href="/admin/policies" className={`sidebar-link sidebar-title link-nav ${pathname.startsWith("/admin/policies") ? "active" : ""}`}><div className="svg-icon"><RiFolderLine /></div><span>Store Policies</span></Link></li>
                <li className="sidebar-list">
                  <Link href="/admin/newsletter" className={`sidebar-link sidebar-title link-nav ${pathname.startsWith("/admin/newsletter") ? "active" : ""}`}>
                    <div className="svg-icon"><span style={{fontSize: 18}}>✉</span></div><span>Newsletter</span>
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
                    <li className="sidebar-list">
                      <Link href="/admin/attributes" className={pathname.startsWith("/admin/attributes") ? "active" : ""}>
                        <div className="svg-icon"><RiStore3Line /></div><span>Attributes</span>
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
