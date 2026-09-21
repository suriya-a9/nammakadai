import axios from "axios";
import getCookie from "../customFunctions/GetCookie";
import Cookies from "js-cookie";

const client = axios.create({
  baseURL: "/api",
  headers: {
    Accept: "application/json",
  },
});

const request = async ({ ...options }, router) => {
  client.defaults.headers.common.Authorization = `Bearer ${getCookie("uat")}`;
  const onSuccess = (response) => response;
  const onError = (error) => {
    if (error?.response?.status == 401) {
      // A customer session is an HTTP-only cookie. Never clear the guest cart on 401.
      if (router && options.url !== "/self") router.push("/auth/login?next=%2Fcheckout");
    }
    return error;
  };
  try {
    const response = await client(options);
    return onSuccess(response);
  } catch (error) {
    return onError(error);
  }
};

export default request;
