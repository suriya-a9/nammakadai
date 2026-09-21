import { Container } from "reactstrap";

const SubFooter = ({ classes }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className={`sub-footer nk-sub-footer ${classes?.sectionClass || ""}`}>
      <Container>
        <div className="nk-sub-footer-content">
          <p>
            Copyright © {currentYear}. All rights reserved. Developed &amp; Maintained By{" "}
            <a href="https://saraswebsolutions.com" target="_blank" rel="noopener noreferrer">SaraS</a>
          </p>
        </div>
      </Container>
    </div>
  );
};

export default SubFooter;
