"use client";

import Slider from "react-slick";

const HomeHeroCarousel = ({ banners = [] }) => {
  if (!banners.length) return null;

  const canSlide = banners.length > 1;

  return (
    <>
    <div className="nk-mobile-static-hero"><img src="/assets/images/banners/mobile_banner.jpeg" alt="Nammakadai mobile banner" width={768} height={768} fetchPriority="high" /></div>
    <div className="nk-home-hero-carousel nk-desktop-hero" aria-label="Homepage banners">
      <Slider
        dots={canSlide}
        arrows={canSlide}
        infinite={canSlide}
        autoplay={canSlide}
        autoplaySpeed={4500}
        speed={650}
        slidesToShow={1}
        slidesToScroll={1}
        swipe={canSlide}
        pauseOnHover
        pauseOnFocus
        accessibility
      >
        {banners.map((banner, index) => (
          <div className="nk-home-hero-slide" key={banner.src}>
            <picture>
              <img
              src={banner.src}
              alt={banner.alt || `Banner ${index + 1}`}
              width={1376}
              height={412}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              />
            </picture>
          </div>
        ))}
      </Slider>
    </div>
    <style jsx>{`
      .nk-mobile-static-hero { display: none; }
      @media (max-width: 767px) {
        .nk-mobile-static-hero { display: block; width: 100%; }
        .nk-mobile-static-hero img { display: block; width: 100%; height: auto; }
        .nk-desktop-hero { display: none; }
      }
    `}</style>
    </>
  );
};

export default HomeHeroCarousel;
