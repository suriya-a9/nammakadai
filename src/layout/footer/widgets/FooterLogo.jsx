import SettingContext from "@/context/settingContext";
import { ImagePath } from "@/utils/constants";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";

const FooterLogo = () => {
  const { settingData } = useContext(SettingContext);
  const logoUrl = `${ImagePath}/icon/logo/nammakadai/NammaKadai Name Logo .png`;

  return (
    <div className="footer-logo">
      <Link href="/">
        <Image
          src={logoUrl}
          height={34}
          width={180}
          alt={settingData?.general?.site_name || "multikart-logo"}
          style={{ width: "auto", height: "auto" }}
        />
      </Link>
    </div>
  );
};

export default FooterLogo;
