import QuickViewButton from './hoverButton/QuickViewButton';
import WishlistButton from './hoverButton/WishlistButton';

const ProductHoverButton = ({ productstate,listClass, actionsToHide}) => {
  return (
    <ul className="hover-action">
      <WishlistButton productstate={productstate} hideAction={actionsToHide}/>
      <QuickViewButton productstate={productstate} />
    </ul>
  );
};

export default ProductHoverButton;