"use client";

import Slider from "react-slick";

const HomeHeroCarousel = ({ banners = [] }) => {
  if (!banners.length) return null;

  const canSlide = banners.length > 1;

  return (
    <div className="nk-home-hero-carousel" aria-label="Homepage banners">
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
            <img
              src={banner.src}
              alt={banner.alt || `Banner ${index + 1}`}
              width={1376}
              height={412}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HomeHeroCarousel;
