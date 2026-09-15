import CurrencyContext from "@/context/currencyContext";
import SettingContext from "@/context/settingContext";
import React, { useContext, useEffect, useState } from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

const HeaderCurrency = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { settingData, selectedCurrency, setSelectedCurrency } = useContext(SettingContext);
  const { currencyState } = useContext(CurrencyContext);
  const toggle = () => setDropdownOpen((prevState) => !prevState);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const getDefaultCurrency = localStorage.getItem("selectedCurrency");
  
    // When currencyState is available
    if (currencyState?.length) {
      try {
        if (!getDefaultCurrency || getDefaultCurrency === "undefined") {
          // Set default to first currency (USD)
          localStorage.setItem("selectedCurrency", JSON.stringify(currencyState[0]));
          setSelectedCurrency(currencyState[0]);
        } else {
          const parsedCurrency = JSON.parse(getDefaultCurrency);
          setSelectedCurrency(parsedCurrency);
        }
        } catch (error) {
          console.error("Error parsing selectedCurrency from localStorage", error);
          localStorage.setItem("selectedCurrency", JSON.stringify(currencyState[0]));
          setSelectedCurrency(currencyState[0]);
      }
    }
  }, [currencyState]);

  const handleClick = (value) => {
    setSelectedCurrency(value);
    localStorage.setItem("selectedCurrency", JSON.stringify(value));
  };

  if (!currencyState?.length) return null;
  return (
    <Dropdown className="theme-form-select" isOpen={dropdownOpen} toggle={toggle}>
      <DropdownToggle caret color="transparent" className="select-dropdown" type="button">
        <span>{selectedCurrency ? selectedCurrency?.code : settingData?.general?.default_currency?.code}</span>
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-end sm-dropdown-menu">
        {currencyState?.map((elem, i) => (
          <DropdownItem id={elem.title} key={i} onClick={() => handleClick(elem)}>
            {elem?.symbol} {elem?.code}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default HeaderCurrency;
