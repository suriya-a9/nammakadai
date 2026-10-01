"use client";
import MobileLoginForm from "@/components/auth/MobileLoginForm";
import Breadcrumbs from "@/utils/commonComponents/breadcrumb";
import { Container, Row, Col } from "reactstrap";
export default function LoginContainer() { return <><Breadcrumbs title="Home" subTitle="Login"/><section className="login-page section-t-space section-b-space"><Container><Row className="justify-content-center"><Col lg="6"><h3>Login with mobile number</h3><div className="theme-card"><MobileLoginForm/></div></Col></Row></Container></section></>; }
