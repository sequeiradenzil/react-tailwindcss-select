import React, { useEffect, createContext, useMemo, useContext, useCallback, useState, useRef } from 'react';

const Spinner = () => {
    return (React.createElement("svg", { className: "animate-spin mr-0.5 h-5 w-5 text-blue-500", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
        React.createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
        React.createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })));
};

const ChevronIcon = ({ className = "" }) => {
    return (React.createElement("svg", { className: className, fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg" },
        React.createElement("path", { fillRule: "evenodd", d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z", clipRule: "evenodd" })));
};

function useOnClickOutside(ref, handler) {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
}

const DisabledItem = ({ children }) => {
    return (React.createElement("div", { className: `px-2 py-2 cursor-not-allowed truncate text-gray-400 select-none` }, children));
};

const SelectContext = createContext({
    value: null,
    handleValueChange: (selected) => { }
});
const useSelectContext = () => {
    return useContext(SelectContext);
};
const SelectProvider = ({ value, handleValueChange, children }) => {
    const store = useMemo(() => {
        return {
            value,
            handleValueChange
        };
    }, [handleValueChange, value]);
    return (React.createElement(SelectContext.Provider, { value: store }, children));
};

const Item = ({ item }) => {
    const { value, handleValueChange } = useSelectContext();
    const isSelected = useMemo(() => {
        return value !== null && !Array.isArray(value) && value.value === item.value;
    }, [item.value, value]);
    return (React.createElement(React.Fragment, null, item.disabled ? (React.createElement(DisabledItem, null, item.label)) : (React.createElement("li", { "aria-selected": isSelected, role: "option", onClick: () => handleValueChange(item), className: `block transition duration-200 px-2 py-2 cursor-pointer select-none truncate rounded ${isSelected ? 'text-white bg-blue-500' : 'text-gray-500 hover:bg-blue-100 hover:text-blue-500'}` }, item.label))));
};

const GroupItem = ({ item }) => {
    return (React.createElement(React.Fragment, null, item.options.length > 0 && (React.createElement(React.Fragment, null,
        React.createElement("div", { className: `pr-2 py-2 cursor-default select-none truncate font-bold text-gray-700` }, item.label),
        item.options.map((item, index) => (React.createElement(Item, { key: index, item: item })))))));
};

const Options = ({ list, noOptionsMessage, text, isMultiple, value }) => {
    const filterByText = useCallback(() => {
        const filterItem = (item) => {
            return item.label.toLowerCase().indexOf(text.toLowerCase()) > -1;
        };
        let result = list.map(item => {
            if ("options" in item) {
                return {
                    label: item.label,
                    options: item.options.filter(filterItem)
                };
            }
            return item;
        });
        result = result.filter(item => {
            if ("options" in item) {
                return item.options.length > 0;
            }
            return filterItem(item);
        });
        return result;
    }, [text, list]);
    const removeValues = useCallback((array) => {
        if (!isMultiple) {
            return array;
        }
        if (Array.isArray(value)) {
            const valueId = value.map(item => item.value);
            const filterItem = (item) => !valueId.includes(item.value);
            let newArray = array.map(item => {
                if ("options" in item) {
                    return {
                        label: item.label,
                        options: item.options.filter(filterItem)
                    };
                }
                return item;
            });
            newArray = newArray.filter(item => {
                if ("options" in item) {
                    return item.options.length > 0;
                }
                else {
                    return filterItem(item);
                }
            });
            return newArray;
        }
        return array;
    }, [isMultiple, value]);
    let filterResult = useMemo(() => {
        return removeValues(filterByText());
    }, [filterByText, removeValues]);
    return (React.createElement("div", { role: "options", className: "max-h-72 overflow-y-auto overflow-y-scroll" },
        filterResult.map((item, index) => (React.createElement(React.Fragment, { key: index }, "options" in item ? (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "px-2.5" },
                React.createElement(GroupItem, { item: item })),
            index + 1 < filterResult.length && (React.createElement("hr", { className: "my-1" })))) : (React.createElement("div", { className: "px-2.5" },
            React.createElement(Item, { item: item })))))),
        filterResult.length === 0 && (React.createElement(DisabledItem, null, noOptionsMessage))));
};

const Select = ({ options = [], value = null, onChange, placeholder = "Select...", searchInputPlaceholder = "Search...", isMultiple = false, isClearable = false, isSearchable = false, isDisabled = false, loading = false, menuIsOpen = false, enableInput = false, noOptionsMessage = "No options found" }) => {
    const [open, setOpen] = useState(menuIsOpen);
    const [list, setList] = useState(options);
    const [inputValue, setInputValue] = useState("");
    const ref = useRef(null);
    useEffect(() => {
        const formatItem = (item) => {
            if ('disabled' in item)
                return item;
            return {
                ...item,
                disabled: false
            };
        };
        setList(options.map(item => {
            if ("options" in item) {
                return {
                    label: item.label,
                    options: item.options.map(formatItem)
                };
            }
            else {
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
    useCallback((e) => {
        e.preventDefault();
        if ((e.code === "Enter" || e.code === "Space") && !isDisabled) {
            toggle();
        }
    }, [isDisabled, toggle]);
    const handleValueChange = useCallback((selected) => {
        function update() {
            if (!isMultiple && !Array.isArray(value)) {
                closeDropDown();
                onChange(selected);
            }
            if (isMultiple && (Array.isArray(value) || value === null)) {
                document.getElementById('filterdiv');
                onChange(value === null ? [selected] : [...value, selected]);
            }
            const filterdiv = document.getElementById('filterdiv');
            if (selected.label !== null && filterdiv !== null) {
                const createspan = document.createElement("span");
                createspan.className = " p-5 border shadow mr-5 inline-flex items-center rounded-full bg-gray-50 py-2 pl-2.5 pr-1 text-sm font-medium";
                const delbutton = document.createElement("button");
                delbutton.addEventListener("click", function handleClick(event) {
                    event.stopPropagation();
                    removeItem(selected);
                    console.log("I am clicked", selected);
                    console.log(value);
                    delbutton?.parentElement?.remove();
                    removeItem(selected);
                });
                delbutton.className = "ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none";
                delbutton.innerHTML = "<span class=\"sr-only\">Remove large option</span>\n" +
                    "                        <svg class=\"h-2 w-2\" stroke=\"currentColor\" fill=\"none\" viewBox=\"0 0 8 8\">\n" +
                    "                          <path strokeLinecap=\"round\" strokeWidth=\"1.5\" d=\"M1 1l6 6m0-6L1 7\"/> \n" +
                    "                        </svg>";
                createspan.innerText = selected.label;
                createspan.appendChild(delbutton);
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
    useCallback((e) => {
        e.stopPropagation();
        onChange(null);
    }, [onChange]);
    const removeItem = useCallback((item) => {
        if (isMultiple && Array.isArray(value) && value.length) {
            const result = value.filter(current => item.value !== current.value);
            onChange(result.length ? result : null);
        }
    }, [isMultiple, onChange, value]);
    return (React.createElement(SelectProvider, { value: value, handleValueChange: handleValueChange },
        React.createElement("div", { className: "relative w-full", ref: ref },
            React.createElement("div", { tabIndex: 0, "aria-expanded": open, onClick: toggle, className: `flex text-sm text-gray-500 border border-gray-300 rounded shadow-sm transition duration-300 focus:outline-none${isDisabled ? ' bg-gray-200' : ' bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500'}` },
                React.createElement("input", { className: "grow pl-2.5 py-2 pr-2 flex flex-wrap gap-1", type: "text", value: inputValue, onChange: e => setInputValue(e.target.value), placeholder: placeholder }),
                React.createElement("div", { className: "flex flex-none items-center py-1.5" },
                    loading && (React.createElement("div", { className: "px-1.5" },
                        React.createElement(Spinner, null))),
                    React.createElement("div", { className: "h-full" },
                        React.createElement("span", { className: "w-px h-full inline-block text-white bg-gray-300 text-opacity-0" })),
                    enableInput ? (React.createElement("div", { className: "absolute flex items-center inset-y-0 right-0" },
                        React.createElement(ChevronIcon, { className: `transition duration-300 w-4 h-4 p-0.5${open ? ' transform rotate-90 text-gray-500' : ' text-gray-300'}` }))) : (React.createElement(React.Fragment, null)))),
            (open && !isDisabled) && (React.createElement("div", { tabIndex: -1, className: " absolute z-[100] w-full bg-white shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700" },
                React.createElement(Options, { list: list, noOptionsMessage: noOptionsMessage, text: inputValue, isMultiple: isMultiple, value: value }))))));
};

export { Select as default };
//# sourceMappingURL=index.esm.js.map
