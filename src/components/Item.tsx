import React, {useMemo} from "react";
import DisabledItem from "./DisabledItem";
import {Option} from "./type";
import {useSelectContext} from "./SelectProvider";

interface ItemProps {
    item: Option
}

const Item: React.FC<ItemProps> = ({item}) => {
    const {value, handleValueChange} = useSelectContext();

    const isSelected = useMemo(() => {
         const filterdiv = document.getElementById('filterdiv');
        if (item.value !== null && filterdiv != null) {
            let addhtml = "   <span\n" +
                "                                className=\"inline-flex items-center rounded-full bg-indigo-100 py-0.5 pl-2.5 pr-1 text-sm font-medium text-indigo-700\">\n" +
                +item.value +
                "  <button type=\"button\"\n" +
                "          className=\"ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none\">\n" +
                "    <span className=\"sr-only\">Remove large option</span>\n" +
                "    <svg className=\"h-2 w-2\" stroke=\"currentColor\" fill=\"none\" viewBox=\"0 0 8 8\">\n" +
                "      <path strokeLinecap=\"round\" strokeWidth=\"1.5\" d=\"M1 1l6 6m0-6L1 7\"/>\n" +
                "    </svg>\n" +
                "  </button>\n" +
                "</span>";
            filterdiv.innerHTML += addhtml;
        }
        return value !== null && !Array.isArray(value) && value.value === item.value;
    }, [item.value, value]);

    return (
        <>
            {item.disabled ? (
                <DisabledItem>
                    {item.label}
                </DisabledItem>
            ) : (
                <li
                    aria-selected={isSelected}
                    role={"option"}
                    onClick={() => handleValueChange(item)}
                    className={`block transition duration-200 px-2 py-2 cursor-pointer select-none truncate rounded ${isSelected ? 'text-white bg-blue-500' : 'text-gray-500 hover:bg-blue-100 hover:text-blue-500' }`}
                >
                    {item.label}
                </li>
            )}
        </>
    );
};

export default Item;