import { useEffect, useState } from 'react';

const DropdownAttribute = ({ elem, soldOutAttributesIds, productState, setVariant, i }) => {
  const [selectedIndex, setSelectedIndex] = useState('');

  useEffect(() => {
    // Automatically select the current variant if it exists
    const index = elem?.attribute_values?.findIndex((value) =>
      productState?.variantIds?.includes(value.id)
    );
    if (typeof index === "number" && index >= 0) {
      setSelectedIndex(String(index));
    } else {
      setSelectedIndex("");
    }
  }, [productState?.variantIds, elem]);

  const handleChange = (e) => {
    const index = e.target.value;
    setSelectedIndex(index);
    const selectedValue = elem?.attribute_values?.[Number(index)];
    if (selectedValue) {
      setVariant(productState?.product?.variations, selectedValue);
    }
  };

  return (
    <select
      id={`input-state-${i}`}
      className='form-control form-select'
      onChange={handleChange}
      value={selectedIndex}
    >
      <option value="" disabled>
        Choose {elem?.name}
      </option>
      {elem?.attribute_values?.map((value, index) => (
        productState?.attributeValues?.includes(value?.id) ? (
          <option key={index} value={index} disabled={soldOutAttributesIds.includes(value.id)}>
            {value?.value}
          </option>
        ) : null
      ))}
    </select>
  );
};

export default DropdownAttribute;
