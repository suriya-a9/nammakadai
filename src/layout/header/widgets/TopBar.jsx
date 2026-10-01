import SettingContext from "@/context/settingContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Col, Row } from "reactstrap";

const TopBar = ({ classes }) => {
  const { t } = useTranslation("common");
  const { themeOption } = useContext(ThemeOptionContext);
  const { settingData } = useContext(SettingContext);

  return (
    <div className={`top-header ${classes?.top_bar_class ? classes?.top_bar_class : ""}`}>
      <div className={`${classes?.container_class ? classes?.container_class : "container"}`}>
        <Row>
          <Col lg={6}>
            <div className="header-contact">
              <ul>
                <li>
                  {t("WelcomeTo")} {settingData?.general?.site_name}
                </li>
                <li>
                  <i className="ri-phone-fill"></i> {t("CallUs")} : {themeOption?.header?.support_number}
                </li>
              </ul>
            </div>
          </Col>
          <Col lg={6} className="nk-top-offer-col">
            <div className="nk-top-offer-marquee" aria-label="Store announcements">
              <div className="nk-top-offer-track">
                <span className="text-white">Explore our latest uniform collections &nbsp; • &nbsp; Discover new arrivals &nbsp; • &nbsp; Check out our latest offers &nbsp; • &nbsp;</span>
                <span aria-hidden="true" className="text-white">Explore our latest uniform collections &nbsp; • &nbsp; Discover new arrivals &nbsp; • &nbsp; Check out our latest offers &nbsp; • &nbsp;</span>
              </div>
            </div>
          </Col>
        </Row>
      </div>
      <style jsx global>{`
        .nk-top-offer-col { display: flex; align-items: center; justify-content: flex-end; min-width: 0; }
        .nk-top-offer-marquee { overflow: hidden; width: 100%; max-width: 550px; white-space: nowrap; mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent); }
        .nk-top-offer-track { display: flex; width: max-content; animation: nk-top-offer-scroll 24s linear infinite; }
        .nk-top-offer-track span { flex: 0 0 auto; padding-right: 2rem; font-size: 12px; font-weight: 600; letter-spacing: .02em; }
        .nk-top-offer-marquee:hover .nk-top-offer-track { animation-play-state: paused; }
        @keyframes nk-top-offer-scroll { to { transform: translateX(-50%); } }
        @media (max-width: 991px) { .nk-top-offer-col { justify-content: center; margin-top: 5px; } .nk-top-offer-marquee { max-width: 100%; } }
        @media (prefers-reduced-motion: reduce) { .nk-top-offer-track { animation: none; } .nk-top-offer-track span[aria-hidden="true"] { display: none; } }
      `}</style>
    </div>
  );
};
export default TopBar;
