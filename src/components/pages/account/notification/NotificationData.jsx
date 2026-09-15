import NoDataFound from "@/components/widgets/NoDataFound";
import Loader from "@/layout/loader";
import request from "@/utils/axiosUtils";
import { NotificationAPI } from "@/utils/axiosUtils/API";
import { showMonthWiseDateAndTime } from "@/utils/customFunctions/DateFormat";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiTimeLine } from "react-icons/ri";
import { Card, CardBody } from "reactstrap";
import AccountHeading from "../common/AccountHeading";

const NotificationData = () => {
  const { t } = useTranslation("common");
  const [isRead, setIsRead] = useState("");
  const { data, isLoading } = useFetchQuery([NotificationAPI], () => request({ url: NotificationAPI }), { enabled: true, refetchOnWindowFocus: false, select: (res) => res?.data?.data });

  useEffect(() => {
    setIsRead("read");
  }, []);

  if (isLoading)
    return (
      <div className="box-loader">
        <Loader classes={"blur-bg"} />
      </div>
    );
  return (
    <Card className="mt-0">
      <CardBody>
        <AccountHeading title="Notifications" classes={"top-sec"} />
        {data?.length > 0 ? (
          <>
            <ul className="notification-list">
              {data?.map((elem, i) => (
                <li key={i} className={!elem?.read_at && isRead !== "read" ? "unread" : ""}>
                  <h4>{elem?.data?.message}</h4>
                  <h5>
                    <RiTimeLine /> {showMonthWiseDateAndTime(elem?.created_at)}
                  </h5>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <NoDataFound imageUrl={`/assets/svg/empty-items.svg`} customClass="no-data-added" title="NoNotificationsFound" description="NoNotificationDescription" height="300" width="300" />
        )}
      </CardBody>
    </Card>
  );
};

export default NotificationData;
