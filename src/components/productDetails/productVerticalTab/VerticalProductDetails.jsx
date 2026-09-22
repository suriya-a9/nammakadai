import NavTabTitles from "@/components/widgets/NavTabs";
import NoDataFound from "@/components/widgets/NoDataFound";
import TextLimit from "@/utils/customFunctions/TextLimit";
import React, { useState } from "react";
import { Col, Row, TabContent, TabPane } from "reactstrap";
import CustomerReview from "../common/CustomerReview";

const VerticalProductDetails = ({ productState }) => {
  let [showMore, setShowMore] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const ProductDetailsTabTitle = [
    { id: 1, name: "Description" },
    { id: 2, name: "Review" },
  ];

  return (
    <>
      <Col xl="2">
        <NavTabTitles classes={{ navClass: "nav nav-tabs nav-material flex-column nav-border" }} titleList={ProductDetailsTabTitle} activeTab={activeTab} setActiveTab={setActiveTab} />
      </Col>
      <Col xl="10">
        <TabContent className="nav-material" activeTab={activeTab}>
          <TabPane className={activeTab == 1 ? "show fade active" : ""}>
            <div className={`product-description more-less-box ${showMore ? "more" : ""}`}>{showMore ? <TextLimit value={productState?.product?.description} /> : <TextLimit value={productState?.product?.description?.substring(0, 1600)} />}</div>
          </TabPane>
          <TabPane className={activeTab == 2 ? "show active" : ""}>
            <div className="single-product-tables ">
              <Row>
                {productState?.product?.can_review || productState?.product?.reviews_count ? (
                  <CustomerReview productState={productState} />
                ) : (
                  <Col xl={12}>
                    <NoDataFound customClass="no-data-added" title="NoReviewYet" description="NoReviewYetDescription" />
                  </Col>
                )}
              </Row>
            </div>
          </TabPane>
        </TabContent>
      </Col>
    </>
  );
};

export default VerticalProductDetails;
