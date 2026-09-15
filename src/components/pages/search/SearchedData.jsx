import NoDataFound from "@/components/widgets/NoDataFound";
import ProductBox from "@/components/widgets/productBox";
import ProductSkeleton from "@/components/widgets/skeletonLoader/ProductSkeleton";
import WrapperComponent from "@/components/widgets/WrapperComponent";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";

const SearchedData = ({ data,fetchStatus }) => {
  const [mainProducts, setMainProducts] = useState([]);
  const param = useSearchParams();
  const searchParam = param.get("search");

  useEffect(() => {
    if (searchParam) {
      setMainProducts(data);
    } else {
      setMainProducts(data?.slice(0, 12));
    }
  }, [searchParam,data]);

  return (
    <WrapperComponent classes={{ sectionClass: "section-b-space", fluidClass: "container" }} noRowCol={true}>
      {fetchStatus == "fetching" ? (
        <Row className="search-product">
          {new Array(8).fill(null).map((_, i) => (
            <Col xl="3" md="2" xs="6" key={i}>
              <ProductSkeleton />
            </Col>
          ))}
          <ProductSkeleton />
        </Row>
      ) : data?.length > 0 ? (
        <Row className="search-product">
          {mainProducts?.map((product, i) => (
            <Col xl="3" md="2" xs="6" key={i}>
              <ProductBox product={product} style="vertical" />
            </Col>
          ))}
        </Row>
      ) : (
        <NoDataFound imageUrl={`/assets/svg/empty-items.svg`} customClass="collection-no-data no-data-added" title="productsNoFound" description="productsNoFoundDescription" height="300" width="300" u />
      )}
    </WrapperComponent>
  );
};

export default SearchedData;
