"use client";
import MobileLoginForm from "@/components/auth/MobileLoginForm";
import ThemeOptionContext from "@/context/themeOptionsContext";
import { useContext } from "react";
import { Modal, ModalBody } from "reactstrap";
export default function AuthModal() { const {openAuthModal,setOpenAuthModal}=useContext(ThemeOptionContext);return <Modal toggle={()=>setOpenAuthModal(false)} className="auth-modal modal-dialog-centered" isOpen={openAuthModal}><ModalBody className="bg-white"><h3>Login with mobile number</h3><MobileLoginForm/></ModalBody></Modal>; }
