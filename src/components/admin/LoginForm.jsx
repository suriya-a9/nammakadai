"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LOGO = "/assets/images/icon/logo/nammakadai/Namma%20Kadai%20Logo.png";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Login failed");
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
                  <h3>Welcome Back</h3>
                  <h4>Log in to your admin account</h4>
                </div>
                <div className="input-box">
                  <form className="row g-4" onSubmit={submit}>
                    {error && <div className="col-12"><div className="admin-auth-message">{error}</div></div>}
                    <div className="col-sm-12">
                      <div className="form-floating">
                        <input
                          className="form-control"
                          id="admin-email"
                          type="email"
                          placeholder="Email Address"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          required
                          autoComplete="email"
                        />
                        <label htmlFor="admin-email">Email Address</label>
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <div className="form-floating">
                        <input
                          className="form-control"
                          id="admin-password"
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          required
                          autoComplete="current-password"
                        />
                        <label htmlFor="admin-password">Password</label>
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <button className="btn btn-animation w-100 justify-content-center" type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Login"}
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
