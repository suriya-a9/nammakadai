"use client";
import NoDataFound from "@/components/widgets/NoDataFound";
import WrapperComponent from "@/components/widgets/WrapperComponent";
import Btn from "@/elements/buttons/Btn";
import Loader from "@/layout/loader";
import request from "@/utils/axiosUtils";
import { CouponAPI } from "@/utils/axiosUtils/API";
import Breadcrumbs from "@/utils/commonComponents/breadcrumb";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Col } from "reactstrap";
import OfferSkeleton from "./OfferSkeleton";

const Offer = () => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { data, isLoading } = useFetchQuery([CouponAPI], () => request({ url: CouponAPI, params: { status: 1 } }, router), {
    enabled: true,
    refetchOnWindowFocus: false,
    select: (data) => data.data.data,
  });

  const onCopyCode = (couponData) => {
    try {
      navigator.clipboard.writeText(couponData);
      ToastNotification("success", "Code Copied To Clipboard");
    } catch (err) {
      ToastNotification("error", err);
    }
  };
  if (isLoading) return <Loader />;
  return (
    <>
      <Breadcrumbs title={"Offer"} subNavigation={[{ name: "Offer" }]} />
      {isLoading ? (
        <OfferSkeleton />
      ) : (
        <WrapperComponent classes={{ sectionClass: "section-b-space section-t-space offer-section", row: "g-md-4 g-3", fluidClass: "container" }} customCol={true}>
          {data?.length ? (
            data?.map((coupon, i) => (
              <Col lg={4} sm={6} key={i}>
                <div className='coupon-box'>
                  <div className='coupon-name'>
                    <div className='card-name'>
                      <div>
                        <h5 className='fw-semibold dark-text'>{coupon.title}</h5>
                      </div>
                    </div>
                  </div>
                  <div className='coupon-content'>
                    <p className='p-0'>{coupon.description}</p>
                    <div className='coupon-apply'>
                      <h6 className='coupon-code success-color'>#{coupon.code}</h6>
                      <Btn color='transparent' className='theme-btn border-btn copy-btn mt-0' onClick={() => onCopyCode(coupon.code)}>
                        {t("CopyCode")}
                      </Btn>
                    </div>
                  </div>
                </div>
              </Col>
            ))
          ) : (
            <NoDataFound customClass='no-data-added' title='No Offers Found' imageUrl={"/assets/svg/empty-items.svg"} description='I regret to inform you that the offer is currently unavailable.' height='300' width='300' />
          )}
        </WrapperComponent>
      )}
    </>
  );
};

export default Offer;
