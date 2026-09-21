"use client";
import Btn from "@/elements/buttons/Btn";
import Breadcrumbs from "@/utils/commonComponents/breadcrumb";
import useHandleLogin from "@/utils/hooks/useLogin";
import { YupObject, emailSchema, passwordSchema } from "@/utils/validation/ValidationSchema";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useTranslation } from "react-i18next";
import { Col, Container, FormGroup, Row } from "reactstrap";
import Link from "next/link";
import { useEffect, useState } from "react";

const LoginContainer = () => {
  const [loginError,setLoginError] = useState("");
  const [registerUrl,setRegisterUrl]=useState("/auth/register");
  useEffect(()=>{const next=new URLSearchParams(window.location.search).get("next");if(next?.startsWith("/")&&!next.startsWith("//"))setRegisterUrl(`/auth/register?next=${encodeURIComponent(next)}`);},[]);
  const { mutate, isLoading } = useHandleLogin(setLoginError);
  const { t } = useTranslation("common");
  return (
    <>
      <Breadcrumbs title={"Home"} subTitle={"Login"} />
      <section className="login-page section-t-space section-b-space">
        <Container>
          <Row>
            <Col lg="6">
              <h3>Login</h3>
              <div className="theme-card">
                <Formik
                  initialValues={{
                    email: "",
                    password: "",
                  }}
                  validationSchema={YupObject({
                    email: emailSchema,
                    password: passwordSchema,
                  })}
                  onSubmit={mutate}
                >
                  {({ errors, touched, setFieldValue }) => (
                    <Form className="theme-form">
                      {loginError && <div className="alert alert-danger" role="alert">{loginError}</div>}
                      <FormGroup>
                        <label htmlFor="email">{t("Email")}</label>
                        <Field name="email" className="form-control" id="email" placeholder="Email" required />
                        {errors.email && touched.email && <ErrorMessage name="email" render={(msg) => <div className="invalid-feedback d-block">{errors.email}</div>} />}
                      </FormGroup>
                      <FormGroup>
                        <label htmlFor="review">{t("Password")}</label>
                        <Field name="password" type="password" className="form-control" id="review" placeholder="Enter your password" required />
                        {errors.password && touched.password && <ErrorMessage name="password" render={(msg) => <div className="invalid-feedback d-block">{errors.password}</div>} />}
                      </FormGroup>
                      <Btn loading={isLoading} type="submit" className="btn-solid">
                        {t("Login")}
                      </Btn>
                    </Form>
                  )}
                </Formik>
              </div>
            </Col>
            <Col lg="6" className="right-login">
              <h3>{t("NewCustomer")}</h3>
              <div className="theme-card authentication-right">
                <h6 className="title-font">{t("CreateAAccount")}</h6>
                <p>{t("SignUpDescription")}</p>
                <Link href={registerUrl} className="btn btn-solid">
                  {t("CreateAccount")}
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default LoginContainer;
