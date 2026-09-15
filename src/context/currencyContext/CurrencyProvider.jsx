import React, { useEffect, useState } from 'react';
import CurrencyContext from '.';
import { CurrencyAPI } from '@/utils/axiosUtils/API';
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import request from '@/utils/axiosUtils';

const CurrencyProvider = (props) => {
  const [currencyState, setCurrencyState] = useState([]);
  const { data, isLoading, refetch } = useFetchQuery([CurrencyAPI], () => request({ url: CurrencyAPI }), { enabled: true, refetchOnWindowFocus: false, select: (res) => res?.data?.data });
  useEffect(() => {
    if (data) {
      setCurrencyState(data);
    }
  }, [isLoading]);

  return <CurrencyContext.Provider value={{ ...props, currencyState }}>{props.children}</CurrencyContext.Provider>;
};

export default CurrencyProvider;
