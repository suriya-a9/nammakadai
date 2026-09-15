"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LOGO = "/assets/images/icon/logo/nammakadai/Namma%20Kadai%20Logo.png";

export default function SetupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Setup failed");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="log-in-section section-b-space">
      <div className="container w-100">
        <div className="row">
          <div className="col-xl-5 col-lg-6 mx-auto">
            <div className="box-wrapper">
              <div className="log-in-box">
                <div className="admin-login-brand">
                  <Image src={LOGO} width={62} height={62} alt="NammaKadai" priority />
                  <span>NammaKadai</span>
                </div>
                <div className="log-in-title text-center">
                  <h3>Admin Setup</h3>
                  <h4>Create the first administrator account</h4>
                </div>
                <div className="input-box">
                  <form className="row g-4" onSubmit={submit}>
                    {error && <div className="col-12"><div className="admin-auth-message">{error}</div></div>}
                    <div className="col-sm-12">
                      <div className="form-floating">
                        <input className="form-control" id="setup-name" placeholder="Name" value={form.name} onChange={set("name")} required />
                        <label htmlFor="setup-name">Name</label>
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <div className="form-floating">
                        <input className="form-control" id="setup-email" type="email" placeholder="Email Address" value={form.email} onChange={set("email")} required />
                        <label htmlFor="setup-email">Email Address</label>
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <div className="form-floating">
                        <input className="form-control" id="setup-password" type="password" minLength={8} placeholder="Password" value={form.password} onChange={set("password")} required />
                        <label htmlFor="setup-password">Password</label>
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <div className="form-floating">
                        <input className="form-control" id="setup-confirm-password" type="password" minLength={8} placeholder="Confirm Password" value={form.confirmPassword} onChange={set("confirmPassword")} required />
                        <label htmlFor="setup-confirm-password">Confirm Password</label>
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <button className="btn btn-animation w-100 justify-content-center" type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Admin"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
