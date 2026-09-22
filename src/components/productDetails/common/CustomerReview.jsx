import ProductRating from "@/components/widgets/productRating";
import Btn from "@/elements/buttons/Btn";
import request from "@/utils/axiosUtils";
import { ReviewAPI } from "@/utils/axiosUtils/API";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RiStarFill } from "react-icons/ri";
import { Col, Progress, Row } from "reactstrap";
import ReviewModal from "./allModal/ReviewModal";
import CustomerQA from "./CustomerQ&A";

const CustomerReview = ({ productState }) => {
  const { t } = useTranslation("common");
  const [modal, setModal] = useState("");
  const { data, isLoading, refetch } = useFetchQuery([ReviewAPI], () => request({ url: ReviewAPI, params: { product_id: productState?.product?.id } }), {
    enabled: Boolean(productState?.product?.id),
    refetchOnWindowFocus: false,
    select: (res) => res?.data?.data,
  });
  return (
    <>
      <Col xl={5}>
        <div className="product-rating-box">
          <Row>
            {productState?.product?.reviews_count ? (
              <Col xl={12}>
                <div className="product-main-rating">
                  <div className="d-flex gap-3">
                    <h2>{productState?.product?.rating_count.toFixed(2)}</h2>
                    <div className="rating-box">
                      <div className="product-rating">
                        <ProductRating totalRating={productState?.product?.rating_count} />
                      </div>
                      <h4>
                        {productState?.product?.reviews_count} {t("Ratings")}
                      </h4>
                    </div>
                  </div>
                </div>
              </Col>
            ) : null}
            <Col xl={12}>
              {productState?.product?.reviews_count ? (
                <ul className="product-rating-list">
                  {productState?.product?.review_ratings
                    ?.slice()
                    ?.reverse()
                    .map((rate, i) => (
                      <li key={i}>
                        <div className="rating-product">
                          <h5>
                            {productState?.product?.review_ratings?.length - 1 - i + 1}
                            <RiStarFill />
                          </h5>
                          <Progress multi>
                            <Progress value={((rate / productState?.product?.reviews_count) * 100).toFixed(0)} />
                          </Progress>
                          <h5 className="total">{rate}</h5>
                        </div>
                      </li>
                    ))}
                </ul>
              ) : null}
              {productState?.product?.can_review ? (
                <div className="review-title-2">
                  <h4 className="fw-bold">{t("Reviewthisproduct")}</h4>
                  <p>{t("Letothercustomersknowwhatyouthink")}.</p>
                  <Btn onClick={() => setModal(productState?.product?.id)} title={productState?.product?.user_review ? t("EditReview") : t("Writeareview")} />
                </div>
              ) : (
                <div className="review-title-2 verified-review-note">
                  <h4 className="fw-bold">Verified buyer reviews</h4>
                  <p>Only logged-in customers whose order for this product has been delivered can write a review and give a star rating.</p>
                </div>
              )}
            </Col>
          </Row>
        </div>
      </Col>
      <ReviewModal modal={modal} setModal={setModal} productState={productState} refetch={refetch} />
      <CustomerQA data={data?.length ? data : productState?.product?.reviews} />
    </>
  );
};

export default CustomerReview;
