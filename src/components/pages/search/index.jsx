"use client";
import WrapperComponent from "@/components/widgets/WrapperComponent";
import Btn from "@/elements/buttons/Btn";
import request from "@/utils/axiosUtils";
import { ProductAPI } from "@/utils/axiosUtils/API";
import Breadcrumbs from "@/utils/commonComponents/breadcrumb";
import { useCustomSearchParams } from "@/utils/hooks/useCustomSearchParams";
import useDebounce from "@/utils/hooks/useDebounce";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiSearchLine } from "react-icons/ri";
import { Container, Input, InputGroup } from "reactstrap";
import SearchedData from "./SearchedData";
const SearchModule = () => {
  const { t } = useTranslation("common");
  const [search] = useCustomSearchParams(["search"]);
  const [searchState, setSearchState] = useState("");
  const debouncedSearch = useDebounce(searchState, 1000); // Add debounce for search input
  const router = useRouter();

  const { data, refetch, isLoading, fetchStatus, isError } = useFetchQuery(
    [ProductAPI, "search"],
    () =>
      request({
        url: ProductAPI,
        params: { search: debouncedSearch, paginate: 12, status: 1 },
      }),
    {
      enabled: false,
      refetchOnWindowFocus: false,
      select: (data) => data.data.data,
      onError: (error) => {
        console.error("Error fetching search results", error); // Error handling
      },
    }
  );

  // Update search state and trigger refetch when query param changes
  useEffect(() => {
    if (search?.search && search?.search !== searchState) {
      setSearchState(search?.search);
      // refetch();
    }
  }, [search]);

  // Trigger refetch when debounced search state changes
  useEffect(() => {
    refetch();
  }, [debouncedSearch]);

  // Handle search input change and push to router
  const onHandleSearch = (e) => {
    setSearchState(e.target.value); // Update local state
    router.push(`/search?search=${e.target?.value}`); // Push search param to URL
  };

  return (
    <>
      <Breadcrumbs title={"Search"} subNavigation={[{ name: "Search" }]} />
      <section className="authentication-page section-t-space">
        <Container>
          <div className="row">
            <WrapperComponent classes={{ sectionClass: "search-block", fluidClass: "container", col: "offset-lg-3" }} colProps={{ lg: "6" }}>
              <form className="form-header form-box" onSubmit={(e) => e.preventDefault()}>
                {" "}
                {/* Prevent form submit */}
                <InputGroup>
                  <Input type="text" className="form-control" placeholder={t("SearchProducts") + "....."} value={searchState} onChange={(e) => onHandleSearch(e)} />
                  <Btn
                    className="btn-solid"
                    onClick={(e) => {
                      e.preventDefault();
                      onHandleSearch(e);
                    }}
                  >
                    {" "}
                    {/* Prevent form submit */}
                    <RiSearchLine />
                    {"  "} {t("Search")}
                  </Btn>
                </InputGroup>
              </form>
            </WrapperComponent>
          </div>
        </Container>
      </section>

      {/* Pass data and fetchStatus to the SearchedData component */}
      <SearchedData data={data} fetchStatus={fetchStatus} isError={isError} />
    </>
  );
};

export default SearchModule;
