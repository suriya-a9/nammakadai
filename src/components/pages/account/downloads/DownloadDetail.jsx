import NoDataFound from "@/components/widgets/NoDataFound";
import Pagination from "@/components/widgets/Pagination";
import Btn from "@/elements/buttons/Btn";
import request from "@/utils/axiosUtils";
import { ImagePath } from "@/utils/constants";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, Input, InputGroup, Table } from "reactstrap";
import AccountHeading from "../common/AccountHeading";
import DropDownCommon from "./DropDownCommon";
import Loader from "@/layout/loader";

const DownloadDetail = () => {
  const { t } = useTranslation("common");
  const [page, setPage] = useState(1);
  const router = useRouter();
  const [term, setTerm] = useState(null);

  const { data, refetch, isLoading } = useFetchQuery(["download"], () => request({ url: "download", params: { page: page, paginate: 10, search: term ?? null } }, router), { enabled: false, refetchOnWindowFocus: false, select: (res) => res?.data });

  useEffect(() => {
    isLoading && refetch();
  }, [isLoading]);

  const handleSearch = () => {
    if (term?.length > 0) {
      refetch();
    } else {
      setTerm(null);
      refetch();
    }
  };

  if (isLoading)
    return (
      <div className="box-loader">
        <Loader classes={"blur-bg"} />
      </div>
    );
  return (
    <Card className="dashboard-table mt-0">
      <CardBody className="p-0">
        <AccountHeading classes="top-sec" title="Downloads" />
        <div className="download-detail dashboard-bg-box">
          <form>
            <InputGroup className="download-form">
              <Input placeholder={t("SearchYourDownload")} onChange={(e) => setTerm(e.target.value)} />
              <Btn title={"Search"} onClick={handleSearch} />
            </InputGroup>
          </form>
        </div>
        <div className="download-detail dashboard-bg-box p-0">
          {data?.data?.length > 0 && (
            <div className="download-table">
              <div className="table-responsive">
                <Table className="user-download-table">
                  <thead>
                    <tr>
                      <th>{t("image")}</th>
                      <th className="table-name">{t("name")}</th>
                      <th>{t("action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data?.map((elem, index) => (
                      <tr key={index}>
                        <td>
                          <Image src={elem?.item_image} className="img-fluid" alt="image" height={60} width={90} />
                        </td>
                        <td className="table-name">{elem.item_name}</td>
                        <td>
                          <DropDownCommon elem={elem} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <div className="product-pagination">
                <div className="theme-pagination-block">
                  <nav className="custome-pagination">
                    <Pagination current_page={data?.current_page} total={data?.total} per_page={data?.per_page} setPage={setPage} />
                  </nav>
                </div>
              </div>
            </div>
          )}
          {!data?.data?.length && <NoDataFound customClass="no-data-added" imageUrl={`/assets/svg/empty-items.svg`} title="NoItemFound" description="NoOrderMadeYet" height="300" width="300" />}
        </div>
      </CardBody>
    </Card>
  );
};

export default DownloadDetail;
