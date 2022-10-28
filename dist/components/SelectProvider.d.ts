import React from "react";
import { Option } from "./type";
interface Store {
    value: Option | Option[] | null;
    handleValueChange: (selected: Option) => void;
}
interface Props {
    value: Option | Option[] | null;
    handleValueChange: (selected: Option) => void;
    children: JSX.Element;
}
export declare const SelectContext: React.Context<Store>;
export declare const useSelectContext: () => Store;
declare const SelectProvider: React.FC<Props>;
export default SelectProvider;
