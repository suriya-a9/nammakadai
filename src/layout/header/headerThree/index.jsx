import CategoryContext from "@/context/categoryContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import { Href } from "@/utils/constants";
import { useHeaderScroll } from "@/utils/hooks/HeaderScroll";
import AccountContext from "@/context/accountContext";
import { useRouter } from "next/navigation";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { RiHeartLine, RiHome2Line, RiMenuLine, RiUserLine } from "react-icons/ri";
import { Button, Col, Container, Row } from "reactstrap";
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
  const isAuthenticated = Boolean(accountData);
  const handleProfileClick = (path) => {
    isAuthenticated ? router.push("/account/dashboard") : setOpenAuthModal(true);
  };
  const UpScroll = useHeaderScroll(false);

  // Desktop header intentionally shows only the first three active main categories.
  // The mobile drawer still exposes the complete category tree.
  const mainCategories = (categoryAPIData?.data || []).slice(0, 3);

  const handleWishlistClick = () => {
    isAuthenticated ? router.push("/wishlist") : setOpenAuthModal(true);
  };
  return (
    <header className={`header-style-1 ${themeOption?.header?.sticky_header_enable && UpScroll ? "sticky fixed" : ""}`}>
      {themeOption?.header?.page_top_bar_enable && <TopBar />}
      <div className="bg-light-xl">
        <Container>
          <Row>
            <Col sm="12">
              <div className="main-menu">
                <div className="menu-left">
                  <div className="toggle-nav" onClick={() => setMobileSideBar(!mobileSideBar)}>
                    <RiMenuLine className="sidebar-bar" />
                  </div>
                  <div className="brand-logo me-lg-4 me-0">
                    <HeaderLogo />
                  </div>
                  <nav className="navbar navbar-expand-sm navbar-light pe-0 header-category-nav">
                    <button className="navbar-toggler" type="button">
                      <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                      <ul className="navbar-nav category-nav me-auto pt-0">
                        {mainCategories.map((category) => (
                          <li key={category.id} className="nav-item header-category-item">
                            <Link className="nav-link" href={`/category/${category.slug}`}>
                              {category.name}
                            </Link>
                            {category.subcategories?.length > 0 && (
                              <ul className="header-category-dropdown">
                                {category.subcategories.map((subcategory) => (
                                  <li key={subcategory.id}>
                                    <Link href={`/category/${subcategory.slug}`}>{subcategory.name}</Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </nav>
                </div>
                <div className="menu-right pull-right">
                  <div>
                    <div className="icon-nav">
                      <ul>
                        <li className="onhover-div">
                          <HeaderSearchbar />
                        </li>
                        <li className="onhover-div">
                          <Link href={isAuthenticated ? "/wishlist" : Href} onClick={handleWishlistClick}>
                            <RiHeartLine />
                          </Link>
                        </li>
                        <li className="onhover-div">
                          <HeaderCart />
                        </li>
                        <li className="onhover-div">
                          <Link href={isAuthenticated ? "/account/dashboard" : Href} onClick={handleProfileClick}>
                            <RiUserLine />
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="border-top-cls">
        <Container>
          <ul className="sm pixelstrap sm-horizontal">
            <div className="classic-header main-navbar">
              <div id="mainnav">
                <div className="header-nav-middle">
                  <div className="main-nav navbar navbar-expand-xl navbar-light navbar-sticky">
                    <div className={`offcanvas offcanvas-collapse order-xl-2 ${mobileSideBar ? "show" : ""} `}>
                      <div className="offcanvas-header navbar-shadow">
                        <h5>{t("Menu")}</h5>
                        <Button close className="lead" id="toggle_menu_btn" type="button" onClick={() => setMobileSideBar(false)}>
                          <div>
                            <i className="ri-close-fill"></i>
                          </div>
                        </Button>
                      </div>
                      <div className="offcanvas-body">
                        <div className="nk-mobile-header-menu d-xl-none">
                          <Link className="nk-mobile-header-home" href="/" onClick={() => setMobileSideBar(false)}>
                            <RiHome2Line />
                            <span>{t("Home")}</span>
                          </Link>

                          <div className="nk-mobile-header-section-title">Categories</div>
                          <ul className="nk-mobile-header-categories">
                            {(categoryAPIData?.data || []).map((category) => (
                              <li key={category.id} className="nk-mobile-header-category">
                                <Link href={`/category/${category.slug}`} onClick={() => setMobileSideBar(false)}>
                                  {category.name}
                                </Link>
                                {category.subcategories?.length > 0 && (
                                  <ul className="nk-mobile-header-subcategories">
                                    {category.subcategories.map((subcategory) => (
                                      <li key={subcategory.id}>
                                        <Link href={`/category/${subcategory.slug}`} onClick={() => setMobileSideBar(false)}>
                                          {subcategory.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="d-none d-xl-block">
                          <MainHeaderMenu />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ul>
        </Container>
      </div>
    </header>
  );
};

export default HeaderThree;