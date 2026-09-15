import useFetchQuery from "@/utils/hooks/useFetchQuery";
import request from "../axiosUtils";
import { HomePageAPI } from "../axiosUtils/API";

const useCustomDataQuery = ({ params }) => {
  return useFetchQuery(
    ["data", params],
    async () => {
      const response = await request({ url: `${HomePageAPI}/${params}`, params: { slug: params } });
      return response?.data?.content;
    },
    {
      select: (data) => data,
      refetchOnWindowFocus: false,
      enabled:false
    }
  );
};

export default useCustomDataQuery;
