import SettingContext from "@/context/settingContext";
import { ImagePath } from "@/utils/constants";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";

const HeaderLogo = ({ extraClass }) => {
  const { settingData } = useContext(SettingContext);
  const logoUrl = `${ImagePath}/icon/logo/nammakadai/NammaKadai Name Logo .png`;

  return (
    <Link href="/" className={extraClass || ""}>
      <Image
        src={logoUrl}
        height={34}
        width={173}
        alt={settingData?.general?.site_name || "multikart-logo"}
        style={{ width: "auto", height: "auto" }}
        priority
      />
    </Link>
  );
};

export default HeaderLogo;
