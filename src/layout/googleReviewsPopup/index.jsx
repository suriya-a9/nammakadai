
"use client";

import { useEffect, useState } from "react";
import { Modal, ModalBody } from "reactstrap";

export default function GoogleReviewsPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem("nammakadai-google-reviews-seen")) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(
        "nammakadai-google-reviews-seen",
        "1"
      );
      setOpen(true);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, []);

  const closePopup = () => setOpen(false);

  return (
    <Modal
      centered
      isOpen={open}
      toggle={closePopup}
      className="google-review-promo"
      contentClassName="border-0 rounded-4 overflow-hidden"
    >
      <ModalBody className="p-0">
        <div
          style={{
            position: "relative",
            padding: "38px 28px 34px",
            textAlign: "center",
            background: "linear-gradient(160deg, #fffaf0, #fff2dc)",
            borderTop: "6px solid #800a1d",
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closePopup}
            aria-label="Close popup"
            style={{
              position: "absolute",
              top: 12,
              right: 16,
              border: "none",
              background: "transparent",
              color: "#800a1d",
              fontSize: 27,
              lineHeight: 1,
              cursor: "pointer",
            }}
          >
            ×
          </button>

          {/* Store name */}
          {/* Nammakadai Logo */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <img
              src="/assets/images/icon/logo/nammakadai/NammaKadai%20Name%20Logo%20.png"
              alt="Nammakadai Bharathi Silks"
              style={{
                width: 190,
                maxWidth: "80%",
                height: 85,
                objectFit: "contain",
              }}
            />
          </div>

          {/* Stars */}
          <div
            aria-label="Five-star rating"
            style={{
              color: "#e4a629",
              fontSize: 39,
              letterSpacing: 5,
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            ★★★★★
          </div>

          {/* Heading */}
          <h2
            style={{
              color: "#4b0714",
              fontSize: "clamp(24px, 5vw, 30px)",
              fontWeight: 800,
              lineHeight: 1.3,
              margin: "0 0 12px",
            }}
          >
            Loved by Our Customers!
          </h2>

          {/* Rating and review count */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            <span
              style={{
                color: "#800a1d",
                background: "#f9e5d4",
                padding: "8px 13px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              ★ 5-Star Rating
            </span>

            <span
              style={{
                color: "#800a1d",
                background: "#f9e5d4",
                padding: "8px 13px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              700+ Google Reviews
            </span>
          </div>

          {/* Description */}
          <p
            style={{
              color: "#65545a",
              fontSize: 14,
              lineHeight: 1.7,
              maxWidth: 370,
              margin: "0 auto 24px",
            }}
          >
            Thank you for trusting Nammakadai.
            Your love and support inspire us every day!
          </p>

          {/* Close popup and continue shopping */}
          <button
            type="button"
            onClick={closePopup}
            style={{
              background: "#800a1d",
              color: "#ffffff",
              padding: "13px 28px",
              borderRadius: 9,
              border: "none",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 5px 15px rgba(128, 10, 29, 0.2)",
            }}
          >
            Explore Nammakadai
          </button>
        </div>
      </ModalBody>
    </Modal>
  );
}