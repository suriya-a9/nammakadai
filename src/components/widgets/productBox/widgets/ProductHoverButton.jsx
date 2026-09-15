import QuickViewButton from './hoverButton/QuickViewButton';
import CompareButton from './hoverButton/CompareButton';
import WishlistButton from './hoverButton/WishlistButton';

const ProductHoverButton = ({ productstate,listClass, actionsToHide}) => {
  return (
    <ul className="hover-action">
      <WishlistButton productstate={productstate} hideAction={actionsToHide}/>
      <QuickViewButton productstate={productstate} />
      <CompareButton productstate={productstate} />
    </ul>
  );
};

export default ProductHoverButton;