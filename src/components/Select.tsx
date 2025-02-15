import React, {createElement, useCallback, useEffect, useRef, useState} from "react";
import Spinner from "./Spinner";
import {ChevronIcon, CloseIcon} from "./Icons";
import useOnClickOutside from "../hooks/use-onclick-outside";
import SearchInput from "./SearchInput";
import Options from "./Options";
import {Option, Options as ListOption} from "./type";
import SelectProvider from "./SelectProvider";

interface SelectProps {
    options: ListOption,
    value: Option | Option[] | null,
    onChange: (value?: Option | Option[] | null) => void,
    placeholder?: string,
    isMultiple?: boolean,
    isClearable?: boolean,
    isSearchable?: boolean,
    isDisabled?: boolean,
    loading?: boolean,
    menuIsOpen?: boolean,
    searchInputPlaceholder?: string,
    noOptionsMessage?: string
    enableInput?: boolean
}

const Select: React.FC<SelectProps> = ({
                                           options = [],
                                           value = null,
                                           onChange,
                                           placeholder = "Select...",
                                           searchInputPlaceholder = "Search...",
                                           isMultiple = false,
                                           isClearable = false,
                                           isSearchable = false,
                                           isDisabled = false,
                                           loading = false,
                                           menuIsOpen = false,
                                           enableInput = false,
                                           noOptionsMessage = "No options found"
                                       }) => {
    const [open, setOpen] = useState<boolean>(menuIsOpen);
    const [list, setList] = useState<ListOption>(options);
    const [inputValue, setInputValue] = useState<string>("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const formatItem = (item: Option) => {
            if ('disabled' in item)
                return item;
            return {
                ...item,
                disabled: false
            }
        }

        setList(options.map(item => {
            if ("options" in item) {
                return {
                    label: item.label,
                    options: item.options.map(formatItem)
                }
            } else {
                return formatItem(item);
            }
        }));
    }, [options]);

    const toggle = useCallback(() => {
        if (!isDisabled) {
            setOpen(!open);
        }
    }, [isDisabled, open]);

    const closeDropDown = useCallback(() => {
        if (open)
            setOpen(false);
    }, [open]);

    useOnClickOutside(ref, () => {
        closeDropDown();
    });

    const onPressEnterOrSpace = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        if ((e.code === "Enter" || e.code === "Space") && !isDisabled) {
            toggle();
        }
    }, [isDisabled, toggle]);

    const handleValueChange = useCallback((selected: Option) => {
        function update() {
            if (!isMultiple && !Array.isArray(value)) {
                closeDropDown();
                onChange(selected);
            }

            if (isMultiple && (Array.isArray(value) || value === null)) {
                const filterdiv = document.getElementById('filterdiv');
                onChange(value === null ? [selected] : [...value, selected]);
            }
            const filterdiv = document.getElementById('filterdiv');
            if (selected.label !== null && filterdiv !== null) {
                const createspan = document.createElement("span")
                createspan.className=" p-5 border shadow mr-5 inline-flex items-center rounded-full bg-gray-50 py-2 pl-2.5 pr-1 text-sm font-medium"
                const delbutton = document.createElement("button")
                delbutton.addEventListener("click",function handleClick(event){
                    event.stopPropagation()
                    removeItem(selected)
                     console.log("I am clicked",selected)
                    console.log(value)
                    delbutton?.parentElement?.remove()
                    removeItem(selected);
                })
                delbutton.className="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
                delbutton.innerHTML="<span class=\"sr-only\">Remove large option</span>\n" +
                    "                        <svg class=\"h-2 w-2\" stroke=\"currentColor\" fill=\"none\" viewBox=\"0 0 8 8\">\n" +
                    "                          <path strokeLinecap=\"round\" strokeWidth=\"1.5\" d=\"M1 1l6 6m0-6L1 7\"/> \n" +
                    "                        </svg>"
                createspan.innerText= selected.label
                createspan.appendChild(delbutton)
                // let addhtml = " <span class=\"mr-5 inline-flex items-center rounded-full bg-indigo-100 py-0.5 pl-2.5 pr-1 text-sm font-medium text-indigo-700\">\n"+ selected.label+
                //     "                     <button  onclick=\"handleremoveItem(e, selected)\"  type=\"button\"\n" +
                //     "                              class=\"ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none\"> +\n" +
                //     "                        <span class=\"sr-only\">Remove large option</span>\n" +
                //     "                        <svg class=\"h-2 w-2\" stroke=\"currentColor\" fill=\"none\" viewBox=\"0 0 8 8\">\n" +
                //     "                          <path strokeLinecap=\"round\" strokeWidth=\"1.5\" d=\"M1 1l6 6m0-6L1 7\"/>\n" +
                //     "                        </svg> \n" +
                //     "                      </button>\n" +
                //     "                    </span>"
                filterdiv.appendChild(createspan);
            }
        }

        if (selected !== value) {
            update();
        }
    }, [closeDropDown, isMultiple, onChange, value]);

    const clearValue = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        onChange(null);
    }, [onChange]);

    const removeItem = useCallback(( item: Option) => {
        if (isMultiple && Array.isArray(value) && value.length) {
            const result = value.filter(current => item.value !== current.value);
            onChange(result.length ? result : null);
        }
    }, [isMultiple, onChange, value]);


    return (
        <SelectProvider
            value={value}
            handleValueChange={handleValueChange}
        >
            <div className="relative w-full" ref={ref}>
                <div tabIndex={0} aria-expanded={open} onClick={toggle}
                     className={`flex text-sm text-gray-500 border border-gray-300 rounded shadow-sm transition duration-300 focus:outline-none${isDisabled ? ' bg-gray-200' : ' bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500'}`}>
                    <input className="grow pl-2.5 py-2 pr-2 flex flex-wrap gap-1" type="text" value={inputValue}
                           onChange={e => setInputValue(e.target.value)} placeholder={placeholder}/>
                    {/*{!isMultiple && !enableInput ? (*/}
                    {/*    <p className="truncate cursor-default select-none">{(value && !Array.isArray(value)) ? value.label : placeholder}</p>*/}
                    {/*) : (*/}
                    {/*    <>*/}
                    {/*        {value === null && placeholder}*/}

                    {/*        {Array.isArray(value) && (*/}
                    {/*            value.map((item, index) => (*/}
                    {/*                <div className={`bg-gray-200 border rounded-sm flex space-x-1${isDisabled ? ' border-gray-500 px-1' : ' pl-1'}`} key={index}>*/}
                    {/*                    <p className="text-gray-600 truncate cursor-default select-none">{item.label}</p>*/}
                    {/*                    {!isDisabled && (*/}
                    {/*                        <div onClick={e => removeItem(e, item)} className={`flex items-center px-1 cursor-pointer rounded-r-sm hover:bg-red-200 hover:text-red-600`}>*/}
                    {/*                            <CloseIcon className="w-3 h-3 mt-0.5"/>*/}
                    {/*                        </div>*/}
                    {/*                    )}*/}
                    {/*                </div>*/}
                    {/*            ))*/}
                    {/*        )}*/}
                    {/*    </>*/}
                    {/*)}*/}

                    <div className="flex flex-none items-center py-1.5">
                        {loading && (
                            <div className="px-1.5">
                                <Spinner/>
                            </div>
                        )}

                        {/*{(isClearable && !isDisabled && value !== null) && (*/}
                        {/*    <div className="px-1.5 cursor-pointer" onClick={clearValue}>*/}
                        {/*        <CloseIcon className={"w-5 h-5 p-0.5"}/>*/}
                        {/*    </div>*/}
                        {/*)}*/}

                        <div className="h-full">
                            <span className="w-px h-full inline-block text-white bg-gray-300 text-opacity-0"/>
                        </div>
                        {enableInput ? (
                            <div className="absolute flex items-center inset-y-0 right-0">
                            <ChevronIcon
                                className={`transition duration-300 w-4 h-4 p-0.5${open ? ' transform rotate-90 text-gray-500' : ' text-gray-300'}`}/>
                        </div>
                        ):(
                            <></>
                        )}

                    </div>
                </div>

                {(open && !isDisabled) && (
                    <div tabIndex={-1}
                         className=" absolute z-[100] w-full bg-white shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700">
                        {/*{isSearchable && (*/}
                        {/*    <SearchInput*/}
                        {/*        value={inputValue}*/}
                        {/*        placeholder={searchInputPlaceholder}*/}
                        {/*        onChange={e => setInputValue(e.target.value)}*/}
                        {/*    />*/}
                        {/*)}*/}

                        <Options
                            list={list}
                            noOptionsMessage={noOptionsMessage}
                            text={inputValue}
                            isMultiple={isMultiple}
                            value={value}
                        />
                    </div>
                )}
            </div>
        </SelectProvider>
    );
};

export default Select;