import AuthModal from "@/components/auth/authModal";
import ThemeOptionContext from "@/context/themeOptionsContext";
import TabFocusChecker from "@/utils/customFunctions/TabFocus";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";
import Cookies from "js-cookie";
import AccountContext from "@/context/accountContext";
import { usePathname } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import { useContext, useEffect, useState } from "react";
import ExitModal from "./exitModal";
import Footers from "./footer";
import Headers from "./header";
import MobileMenu from "./header/widgets/MobileMenu";
import NewsLetterModal from "./newsLetterModal";

const SubLayout = ({ children }) => {
  const isTabActive = TabFocusChecker();
  const { themeOption, setOpenAuthModal } = useContext(ThemeOptionContext);
  const [makeExitActive, setMakeExitActive] = useState(false);
  const pathName = usePathname();
  const disableMetaTitle = ["product", "blogs", "brand"];
  const { accountData, authLoading } = useContext(AccountContext);
  const accountVerified = Boolean(accountData);
  const authToast = Cookies.get("showAuthToast");

  const protectedRoutes = [`/account/dashboard`, `/account/notification`, `/account/bank-details`, `/account/bank-details`, `/account/refund`, `/account/order`, `/account/addresses`, `/wishlist`];

  useEffect(() => {
    if (!authLoading && !accountVerified && authToast && protectedRoutes.includes(pathName)) {
      ToastNotification("error", "Unauthenticated");
      setOpenAuthModal(true);
    }
    return () => Cookies.remove("showAuthToast");
  }, [pathName]);

  useEffect(() => {
    setThemeColor("#800A1D");
    setThemeColor2("");
  }, [pathName]);

  //  Setting the current url in cookies for redirection of protected routes
  useEffect(() => {
    if (typeof window !== "undefined") {
      Cookies.set("currentPath", window.location.pathname + window.location.search);
    }
  }, [pathName]);

  const [themeColor, setThemeColor] = useState("");
  const [themeColor2, setThemeColor2] = useState("");

  useEffect(() => {
    if (themeColor) {
      document.body.style.setProperty("--theme-color", themeColor);
    }
    if (themeColor2) {
      document.body.style.setProperty("--theme-color2", themeColor2);
    } else {
      document.body.style.removeProperty("--theme-color2");
    }
  }, [themeColor, themeColor2]);

  useEffect(() => {
    const message = themeOption?.general?.taglines;
    let timer;

    const updateTitle = (index) => {
      document.title = message[index];
      timer = setTimeout(() => {
        const nextIndex = (index + 1) % message.length;
        updateTitle(nextIndex);
      }, 500);
    };

    if (!disableMetaTitle.includes(pathName.split("/")[1].toLowerCase())) {
      if (!isTabActive && themeOption?.general?.exit_tagline_enable) {
        updateTitle(0);
      } else {
        let value = themeOption?.general?.site_title && themeOption?.general?.site_tagline ? `${themeOption?.general?.site_title} | ${themeOption?.general?.site_tagline}` : "NammaKadai Bharathi Silks";
        document.title = value;
        clearTimeout(timer);
      }
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isTabActive, themeOption]);

  return (
    <>
      <Headers />
      {pathName?.split("/")[1].toLowerCase() != "product" && <MobileMenu />}
      {children}
      <AuthModal />
      <Footers />
      <NextTopLoader showSpinner={false} />
      {themeOption?.popup?.news_letter?.is_enable && <NewsLetterModal setMakeExitActive={setMakeExitActive} />}
      {themeOption?.popup?.exit?.is_enable && makeExitActive && <ExitModal dataApi={themeOption?.popup?.exit} headerLogo={themeOption?.logo?.header_logo?.original_url} />}
    </>
  );
};

export default SubLayout;
