import SearchModule from "@/components/pages/search";
import { Suspense } from "react";

const Search = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchModule />
    </Suspense>
  );
};

export default Search;