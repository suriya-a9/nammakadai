import AccountContext from "@/context/accountContext";
import request from "@/utils/axiosUtils";
import { CountryAPI } from "@/utils/axiosUtils/API";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AccountSection from "./checkoutFormData/AccountSection";
import BillingAddressForm from "./checkoutFormData/BillingAddressForm";
import DeliverySection from "./checkoutFormData/DeliverySection";
import PaymentSection from "./checkoutFormData/PaymentSection";
import ShippingAddressForm from "./checkoutFormData/ShippingAddressForm";

const CheckoutForm = ({ values, setFieldValue, errors }) => {
  const { accountData, refetch } = useContext(AccountContext);
  const { t } = useTranslation("common");
  const [address, setAddress] = useState([]);
  const router = useRouter();
  useEffect(() => {
    accountData?.address.length > 0 && setAddress((prev) => [...accountData?.address]);
  }, [accountData]);

  const { data } = useFetchQuery([CountryAPI], () => request({ url: CountryAPI }, router), {
    refetchOnWindowFocus: false,
    select: (res) => res.data.map((country) => ({ id: country.id, name: country.name, state: country.state })),
  });

  return (
    <>
      <AccountSection setFieldValue={setFieldValue} values={values} />
      <ShippingAddressForm setFieldValue={setFieldValue} errors={errors} data={data} values={values} />
      <BillingAddressForm setFieldValue={setFieldValue} errors={errors} data={data} values={values} />
      <DeliverySection values={values} setFieldValue={setFieldValue} />
      <PaymentSection values={values} setFieldValue={setFieldValue} />
    </>
  );
};

export default CheckoutForm;
