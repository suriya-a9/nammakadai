"use client";
import CategoryMainPage from "@/components/category";
import { useParams } from "next/navigation";

const categorySlugPage = () => {
  const params = useParams();
  return <CategoryMainPage slug={params?.categorySlug} />;
};

export default categorySlugPage;
