"use client";
import WrapperComponent from "@/components/widgets/WrapperComponent";
import Breadcrumbs from "@/utils/commonComponents/breadcrumb";
import React from "react";
import { Col, TabPane } from "reactstrap";
import AccountSidebar from "../common/AccountSidebar";
import ResponsiveMenuOpen from "../common/ResponsiveMenuOpen";
import DownloadDetail from "./DownloadDetail";

const AccountDownloads = () => {
  return (
    <>
      <Breadcrumbs title={"Downloads"} subNavigation={[{ name: "Downloads" }]} />
      <WrapperComponent classes={{ sectionClass: "dashboard-section section-b-space user-dashboard-section", fluidClass: "container" }} customCol={true}>
        <AccountSidebar tabActive={"downloads"} />
        <Col xxl={9} lg={8}>
          <ResponsiveMenuOpen />
          <div className="faq-content">
            <div className="tab-content">
            <TabPane className="show active">
              <DownloadDetail />
              </TabPane>
              </div>
          </div>
        </Col>
      </WrapperComponent>
    </>
  );
};

export default AccountDownloads;
