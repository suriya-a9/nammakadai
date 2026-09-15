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
          <Col lg={6} className="text-end">
          </Col>
        </Row>
      </div>
    </div>
  );
};
export default TopBar;
