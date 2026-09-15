"use client";
import NoDataFound from "@/components/widgets/NoDataFound";
import WrapperComponent from "@/components/widgets/WrapperComponent";
import Loader from "@/layout/loader";
import request from "@/utils/axiosUtils";
import { FaqAPI } from "@/utils/axiosUtils/API";
import Breadcrumbs from "@/utils/commonComponents/breadcrumb";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Container } from "reactstrap";

const BrowserFaq = () => {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(1);
  const toggle = (id) => {
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }
  };
  const { data, isLoading } = useFetchQuery([FaqAPI], () => request({ url: FaqAPI, params: { status: 1 } }), {
    enabled: true,
    refetchOnWindowFocus: false,
    select: (data) => data?.data?.data,
  });

  if (isLoading) return <Loader />;
  return (
    <>
      <Breadcrumbs title={`FAQ's`} subNavigation={[{ name: `FAQ's` }]} />
      {data?.length > 0 ? (
        <WrapperComponent classes={{ sectionClass: "faq-section section-b-space", fluidClass: "container", colClass: "col-sm-12" }}>
          <Accordion className="faq-accordion" aria-expanded={toggle} open={open} toggle={toggle}>
            {data?.map((faq, i) => (
              <AccordionItem className="card" key={i}>
                <AccordionHeader className="card-header" targetId={i + 1}>
                  {faq?.title}
                </AccordionHeader>
                <AccordionBody className="card-body" accordionId={i + 1}>
                  <p>{faq?.description}</p>
                </AccordionBody>
              </AccordionItem>
            ))}
          </Accordion>
        </WrapperComponent>
      ) : (
        <section className="section-b-space section-t-space">
          <Container>
            <NoDataFound customClass="no-data-added" imageUrl={'/assets/svg/empty-items.svg'} title="NoFAQFound" description="NoFAQDescription" height="300" width="300" />
          </Container>
        </section>
      )}
    </>
  );
};

export default BrowserFaq;
