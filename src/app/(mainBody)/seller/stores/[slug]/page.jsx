import SingleStoreDetail from "@/components/seller/stores/singleStoreDetail";

const SellerStoreDetail = async ({ params }) => {
  const { slug } = await params;
  return <SingleStoreDetail params={slug} />;
};
export default SellerStoreDetail;
