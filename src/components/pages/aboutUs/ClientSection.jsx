import WrapperComponent from "@/components/widgets/WrapperComponent";
import ThemeOptionContext from "@/context/themeOptionsContext";
import { storageURL } from "@/utils/constants";
import Image from "next/image";
import { Fragment, useContext } from "react";
import Slider from "react-slick";
import { Media } from "reactstrap";

const ClientSectionSlider = {
  arrows: true,
  loop: true,
  slidesToShow: 2,
  slidesToScroll: 1,
};

const ClientSection = () => {
  const { themeOption } = useContext(ThemeOptionContext);
  return (
    <WrapperComponent classes={{ sectionClass: "testimonial small-section", fluidClass: "container" }} colProps={{ sm: 12 }}>
      <div className="title1">
        <h4>{ themeOption?.about_us?.testimonial?.sub_title }</h4>
        <h2 className="title-inner1">{ themeOption?.about_us?.testimonial?.title }</h2>
      </div>
      <div className="slide-2 testimonial-slider no-arrow">
        <Slider {...ClientSectionSlider}>
          {themeOption?.about_us?.testimonial?.reviews?.map((data, index) => (
            <div key={index}>
              <div className="media">
                <div className="text-center">
                  {data?.profile_image_url && <Image height={79.06} width={58.5} src={storageURL + data?.profile_image_url} alt={data?.title} />}
                  <h5>{data?.title}</h5>
                  <h6>{data?.designation}</h6>
                </div>
                <Media body>
                  <p>{data?.review}</p>
                </Media>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </WrapperComponent>
  );
};

export default ClientSection;
