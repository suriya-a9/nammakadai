"use client";
import AccountContext from "@/context/accountContext";
import { CapitalizeMultiple } from "@/utils/customFunctions/Capitalize";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Col, Row } from "reactstrap";

const ProfileInformation = () => {
  const { t } = useTranslation("common");
  const { accountData, refetch } = useContext(AccountContext);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    setForm({
      name: accountData?.name || "",
      email: accountData?.email || "",
      phone: accountData?.phone || "",
    });
  }, [accountData]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setMessage("");
    try {
      const res = await fetch("/api/self", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to update profile");
      await refetch();
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const addresses = accountData?.addresses || accountData?.address || [];
  const defaultAddress = addresses.find((a) => a.is_default || a.isDefault) || addresses[0];

  return (
    <div className="box-account box-info">
      <Row><Col xs={12}>
        <div className="box-account box-info">
          <div className="box-head d-flex justify-content-between align-items-center gap-3">
            <h4 className="mb-0">{t("AccountInformation")}</h4>
            {!editing && <button type="button" className="btn btn-solid btn-sm" onClick={() => { setEditing(true); setMessage(""); setError(""); }}>Edit Profile</button>}
          </div>

          {editing ? (
            <form onSubmit={saveProfile} className="mt-3">
              <Row className="g-3">
                <Col md={6}><label className="form-label">Full Name</label><input className="form-control" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required /></Col>
                <Col md={6}><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required /></Col>
                <Col md={6}><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} /></Col>
              </Row>
              {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-solid" type="submit" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
                <button className="btn btn-outline-secondary" type="button" disabled={saving} onClick={()=>{setEditing(false);setForm({name:accountData?.name||"",email:accountData?.email||"",phone:accountData?.phone||""});setError("");}}>Cancel</button>
              </div>
            </form>
          ) : (
            <ul className="box-content mt-3">
              <li><h6>{t("FullName")} : {CapitalizeMultiple(accountData?.name)}</h6></li>
              <li><h6>Email : {accountData?.email || "Not provided"}</h6></li>
              <li><h6>{t("Phone")} : {accountData?.phone || "Not provided"}</h6></li>
              {defaultAddress && <li><h6>{t("Address")} : {defaultAddress.address || defaultAddress.street}, {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}</h6></li>}
            </ul>
          )}
          {message && !editing && <div className="alert alert-success mt-3 mb-0">{message}</div>}
        </div>
      </Col></Row>
    </div>
  );
};
export default ProfileInformation;
