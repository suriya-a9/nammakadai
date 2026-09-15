import NoDataFound from "@/components/widgets/NoDataFound";
import request from "@/utils/axiosUtils";
import { PointAPI } from "@/utils/axiosUtils/API";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import { useEffect, useState } from "react";
import { Card, CardBody } from "reactstrap";
import PointTable from "./PointTable";
import Loader from "@/layout/loader";

const PointTopBar = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useFetchQuery([PointAPI], () => request({ url: PointAPI, params: { page, paginate: 10 } }), {
    enabled: false,
    refetchOnWindowFocus: false,
    select: (res) => res?.data,
  });
  useEffect(() => {
    refetch();
  }, [page]);

  if (isLoading)
    return (
      <div className="box-loader">
        <Loader classes={"blur-bg"} />
      </div>
    );
  return (
    <Card className="dashboard-table mt-0">
      <CardBody className="table-responsive-sm p-0">
        {data?.transactions?.data?.length > 0 ? (
          <>
            <PointTable data={data} setPage={setPage} />
          </>
        ) : (
          <NoDataFound
            customClass="no-data-added"
            imageUrl={`/assets/svg/empty-items.svg`}
            title="NoTransactionFound"
            description="YouHaveNotEarnedAnyPointsYet"
            height="300"
            width="300"
          />
        )}
      </CardBody>
    </Card>
  );
};

export default PointTopBar;
