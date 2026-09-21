"use client";
import WishlistContent from "@/components/pages/wishlist";
import WrapperComponent from "@/components/widgets/WrapperComponent";
import Breadcrumb from "@/utils/commonComponents/breadcrumb";
import { Col, TabPane } from "reactstrap";
import AccountSidebar from "../common/AccountSidebar";
import ResponsiveMenuOpen from "../common/ResponsiveMenuOpen";

const AccountWishlist = () => (
  <>
    <Breadcrumb title="Wishlist" subNavigation={[{ name: "Wishlist" }]} />
    <WrapperComponent classes={{ sectionClass: "dashboard-section section-b-space user-dashboard-section", fluidClass: "container" }} customCol>
      <AccountSidebar tabActive="wishlist" />
      <Col lg={9}><div className="faq-content"><div className="tab-content"><ResponsiveMenuOpen /><TabPane className="show fade active">
        <WishlistContent embedded />
      </TabPane></div></div></Col>
    </WrapperComponent>
  </>
);
export default AccountWishlist;
