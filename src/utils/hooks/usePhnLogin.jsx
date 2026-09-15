import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import request from "../axiosUtils";
import { LoginPhnAPI } from "../axiosUtils/API";

const useHandlePhnLogin = (setShowBoxMessage, setState) => {
  const router = useRouter();
  return useMutation({
    mutationFn: (data) => request({ url: LoginPhnAPI, method: "post", data }),
    onSuccess: (responseData, requestData) => {
      if (responseData.status === 200) {
        Cookies.set("uc", requestData.country_code);
        Cookies.set("up", requestData.phone);
        setState("otp");
      } else {
        setShowBoxMessage(responseData.response.data.message);
      }
    },
  });
};

export default useHandlePhnLogin;
