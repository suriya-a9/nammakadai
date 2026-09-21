import ThemeOptionContext from "@/context/themeOptionsContext";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { RiMailLine, RiMapPinLine, RiPhoneLine } from "react-icons/ri";

const FooterStoreInformation = ({ icon }) => {
  const { t } = useTranslation("common");
  const { themeOption } = useContext(ThemeOptionContext);
  const phone = themeOption?.footer?.support_number;
  const email = themeOption?.footer?.about_email?.toLowerCase();
  const phoneHref = phone ? `tel:${String(phone).replace(/[^+\d]/g, "")}` : "#";

  return (
    <ul className={icon ? "contact-list" : "contact-details"}>
      {themeOption?.footer?.about_address && (
        <li>
          {icon && <RiMapPinLine />}
          <span>{themeOption.footer.about_address}</span>
        </li>
      )}
      {phone && (
        <li>
          {icon && <RiPhoneLine />}
          <span>{t("CallUs")}: <a className="nk-footer-contact-link" href={phoneHref}>{phone}</a></span>
        </li>
      )}
      {email && (
        <li>
          {icon && <RiMailLine />}
          <span>{t("EmailUs")}: <a className="nk-footer-contact-link" href={`mailto:${email}`}>{email}</a></span>
        </li>
      )}
    </ul>
  );
};

export default FooterStoreInformation;
