import NoDataFound from "@/components/widgets/NoDataFound";
import Pagination from "@/components/widgets/Pagination";
import SettingContext from "@/context/settingContext";
import Loader from "@/layout/loader";
import request from "@/utils/axiosUtils";
import { WalletConsumerAPI } from "@/utils/axiosUtils/API";
import { ImagePath } from "@/utils/constants";
import Capitalize from "@/utils/customFunctions/Capitalize";
import { showMonthWiseDateAndTime } from "@/utils/customFunctions/DateFormat";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, Col, Row, Table } from "reactstrap";

const WalletCard = () => {
  const [page, setPage] = useState(1);
  const { t } = useTranslation("common");
  const { data, isLoading, refetch } = useFetchQuery([WalletConsumerAPI], () => request({ url: WalletConsumerAPI, params: { page, paginate: 10 } }), {
    enabled: false,
    refetchOnWindowFocus: false,
    select: (res) => res?.data,
  });
  const { convertCurrency } = useContext(SettingContext);
  useEffect(() => {
    refetch();
  }, [page]);

  if (isLoading)
    return (
      <div className="box-loader">
        <Loader classes={'blur-bg'} />
      </div>
    );
  return (
    <>
      {data?.transactions?.data?.length > 0 ? (
        <Row className="g-3">
          <Col xs="12">
            <Card>
              <CardBody>
                <div className="total-box mt-0">
                  <div className="total-contain wallet-bg">
                    <div className="wallet-point-box">
                      <div className="total-image">
                        <Image src={`${ImagePath}/icon/dashboard/account1.png`} height={60} width={60} alt="wallet" />
                      </div>
                      <div className="total-detail">
                        <div className="total-box">
                          <h5>{t("WalletBalance")}</h5>
                          <h3>{data ? convertCurrency(data?.balance) : 0}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xs="12">
            <Card className="dashboard-table mt-0">
              <CardBody className="p-0">
                <div className="wallet-table">
                  <div className="table-responsive">
                    <Table className="table cart-table order-table">
                      <thead>
                        <tr>
                          <th>{t("Date")}</th>
                          <th>{t("Amount")}</th>
                          <th>{t("Remark")}</th>
                          <th>{t("Status")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.transactions?.data?.map((transaction, i) => (
                          <tr key={i}>
                            <td>{showMonthWiseDateAndTime(transaction?.created_at)}</td>
                            <td>{convertCurrency(transaction.amount)}</td>
                            <td>{transaction.detail}</td>
                            <td>
                              <div className={`${transaction.type == "credit" ? "badge bg-credit custom-badge rounded-0" : "badge bg-debit custom-badge rounded-0"}`}>
                                <span>{Capitalize(transaction?.type)}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
                <div className="product-pagination">
                  <div className="theme-pagination-block">
                    <nav>
                      <Pagination current_page={data?.transactions?.current_page} total={data?.transactions?.total} per_page={data?.transactions?.per_page} setPage={setPage} />
                    </nav>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      ) : (
        <NoDataFound customClass="no-data-added" imageUrl={`/assets/svg/empty-items.svg`} title="NoTransactionsFound" description={'No wallet balance activity detected'} height="300" width="300" />
      )}
    </>
  );
};

export default WalletCard;
