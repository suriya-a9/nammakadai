import useCustomerAuth from "./useCustomerAuth";
export const LogInSchema = null;
export default function useHandleLogin(onError){return useCustomerAuth("login",onError);}
