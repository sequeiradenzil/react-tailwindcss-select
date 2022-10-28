import React from "react";
import { Option, Options as ListOption } from "./type";
interface SelectProps {
    options: ListOption;
    value: Option | Option[] | null;
    onChange: (value?: Option | Option[] | null) => void;
    placeholder?: string;
    isMultiple?: boolean;
    isClearable?: boolean;
    isSearchable?: boolean;
    isDisabled?: boolean;
    loading?: boolean;
    menuIsOpen?: boolean;
    searchInputPlaceholder?: string;
    noOptionsMessage?: string;
}
declare const Select: React.FC<SelectProps>;
export default Select;
