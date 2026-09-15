import CompareContext from "@/context/compareContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import Btn from "@/elements/buttons/Btn";
import { CompareAPI } from "@/utils/axiosUtils/API";
import useCreate from "@/utils/hooks/useCreate";
import Cookies from "js-cookie";
import { useContext, useEffect } from "react";
import { RiRefreshLine } from "react-icons/ri";

const CompareButton = ({ productstate, customClass, hideAction, text }) => {
  const { compareState, setCompareState, refetch } = useContext(CompareContext);
  const cookieUAT = Cookies.get("uat");
  const { data, mutate, isLoading } = useCreate(CompareAPI, false, false, "Added to Compare List", false, false, false, refetch);
  const { setOpenAuthModal } = useContext(ThemeOptionContext);

  const addToCompare = (productstate) => {
    if (!cookieUAT) {
      Cookies.set("compareId", productstate?.id);
      setOpenAuthModal(true);
    } else {
      // Put your logic here
    }
  };
  useEffect(() => {
    if (data?.status == 200 || data?.status == 201) {
      setCompareState([...compareState, productstate]);
    }
  }, [isLoading]);
  return (
    <>
      {customClass ? (
        <Btn className={customClass ?? ""} onClick={() => addToCompare(productstate)}>
          <RiRefreshLine />
        </Btn>
      ) : (
        !hideAction?.includes("compare") && (
          <div title="Compare" onClick={() => addToCompare(productstate)}>
            <a>
              <RiRefreshLine /> {text ? text : ""}
            </a>
          </div>
        )
      )}
    </>
  );
};

export default CompareButton;
