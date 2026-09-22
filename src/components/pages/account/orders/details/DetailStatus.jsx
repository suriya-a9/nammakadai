import { showMonthWiseDate } from "@/utils/customFunctions/DateFormat";
import Image from "next/image";
import cancelledImage from "../../../../../../public/assets/svg/tracking/cancelled.svg";
import deliveredImage from "../../../../../../public/assets/svg/tracking/delivered.svg";
import pendingImage from "../../../../../../public/assets/svg/tracking/pending.svg";
import processingImage from "../../../../../../public/assets/svg/tracking/processing.svg";
import shippedImage from "../../../../../../public/assets/svg/tracking/shipped.svg";

const FLOW = [
  { name: "Placed", slug: "placed", image: pendingImage },
  { name: "Confirmed", slug: "confirmed", image: pendingImage },
  { name: "Processing", slug: "processing", image: processingImage },
  { name: "Shipped", slug: "shipped", image: shippedImage },
  { name: "Delivered", slug: "delivered", image: deliveredImage },
];

const DetailStatus = ({ data }) => {
  const current = String(data?.status || data?.order_status?.name || "placed").toLowerCase();
  const currentIndex = FLOW.findIndex((item) => item.slug === current);
  if (!data) return null;

  if (current === "cancelled") {
    return <div className="mb-4"><div className="tracking-panel"><ul><li className="active cancelled-box"><div className="panel-content"><div className="icon"><Image src={cancelledImage} className="img-fluid" alt="Cancelled" height={44} width={44}/></div><div><div className="status">Cancelled</div><div className="panel-content">{showMonthWiseDate(data?.created_at)}</div></div></div></li></ul></div></div>;
  }

  return <div className="mb-4"><div className="tracking-panel"><ul>{FLOW.map((item,index)=><li key={item.slug} className={index <= Math.max(0,currentIndex) ? "active" : ""}><div className="panel-content"><div className="icon"><Image src={item.image} className="img-fluid" alt={item.name} height={44} width={44}/></div><div><div className="status">{item.name}</div>{index <= Math.max(0,currentIndex) && <div className="panel-content">{showMonthWiseDate(data?.created_at)}</div>}</div></div></li>)}</ul></div></div>;
};
export default DetailStatus;
