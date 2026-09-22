import { Progress } from "reactstrap";

const AddProductDetail = ({ productState }) => {
  const quantity = Number(productState?.selectedVariation?.quantity ?? productState?.product?.quantity ?? 0);
  if (quantity <= 0 || quantity >= 5) return null;
  return (
    <div className="progress-sec">
      <div className="left-progressbar">
        <h6>Hurry! Only {quantity} left in stock</h6>
        <Progress className={quantity <= 2 ? "danger-progress" : "warning-progress"} striped animated value={Math.max(15, 100 - quantity * 18)} />
      </div>
    </div>
  );
};

export default AddProductDetail;
