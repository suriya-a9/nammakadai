import ThemeOptionContext from "@/context/themeOptionsContext";
import { storageURL } from "@/utils/constants";
import Image from "next/image";
import { useContext } from "react";
import { Col, Container, Row } from "reactstrap";

const SubFooter = ({ classes }) => {
  const { themeOption } = useContext(ThemeOptionContext);
  const currentYear = new Date().getFullYear();
  const copyrightYear = `${currentYear}-${String(currentYear + 1).slice(-2)}`;

  return (
    <div className={`sub-footer ${classes?.sectionClass ? classes?.sectionClass : ""}`}>
      <Container>
        <Row>
          {themeOption?.footer?.footer_copyright && (
            <Col xl="6" md="6" sm="12">
              <div className="footer-end">
                <p>
                  {copyrightYear} {themeOption?.footer?.copyright_content}
                </p>
              </div>
            </Col>
          )}
          {/* {themeOption?.footer?.payment_option_image_url && (
            <div className="col-xl-6 col-md-6 col-sm-12">
              <div className="payment-card-bottom">
                <Image height={34} width={130} src={storageURL + themeOption?.footer?.payment_option_image_url} alt="payment options" />
              </div>
            </div>
          )} */}
        </Row>
      </Container>
    </div>
  );
};

export default SubFooter;
