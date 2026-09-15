import Btn from "@/elements/buttons/Btn";
import { Href } from "@/utils/constants";
import { obscureEmail } from "@/utils/customFunctions/EmailFormats";
import { Form, Formik } from "formik";
import Cookies from "js-cookie";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "reactstrap";

const OTPVerificationForm = ({ setState }) => {
  const mobileNumber = Cookies.get("up");
  const email = Cookies.get("ue");
  const [otp, setOtp] = useState("");
  const { t } = useTranslation("common");
  const handleChange = (e) => {
    if (e.target.value.length <= 6 && !isNaN(Number(e.target.value))) {
      setOtp(e.target.value);
    }
  };
  return (
    <>
      <Formik
        initialValues={{
          email: "",
        }}
      >
        {() => (
          <Form className="auth-form-box">
            <div className="log-in-title">
              <h5>
                {t("CodeSend") + " "}
                <span>{mobileNumber||obscureEmail(email)}</span>
              </h5>
            </div>
            <div className="auth-box mb-3 outer-otp">
              <div className="inner-otp" id="otp">
                <Input type="text" className="no-background" maxLength="6" onChange={handleChange} value={otp} />
              </div>
            </div>
            <Btn type="submit" title={"Verify"} />
            <a onClick={() => setState("forgot")} href={Href} className="modal-back">
              <i className="ri-arrow-left-line"></i>
            </a>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default OTPVerificationForm;
