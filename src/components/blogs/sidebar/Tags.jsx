"use client";
import NoDataFound from "@/components/widgets/NoDataFound";
import request from "@/utils/axiosUtils";
import { TagAPI } from "@/utils/axiosUtils/API";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import Link from "next/link";
import React from "react";

const Tags = () => {
  const { data: BlogTagData, isLoading } = useFetchQuery([TagAPI], () => request({ url: TagAPI, params: { type: "post" } }), {
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    select: (data) => data.data.data,
  });

  return (
    <div className="theme-card">
      <h4>Tags</h4>
      {BlogTagData?.length > 0 ? (
        <ul className="tags">
          <li>
            <Link href={`/blogs`}>{"All"}</Link>
          </li>
          {BlogTagData?.map((tags, index) => (
            <li key={index}>
              <Link href={{ pathname: `/blogs`, query: { tag: tags?.slug } }}>{tags.name}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <NoDataFound customClass="bg-light no-data-added" title="NoTagsFound" />
      )}
    </div>
  );
};

export default Tags;
