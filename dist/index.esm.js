import React, { useEffect, createContext, useMemo, useContext, useCallback, useState, useRef } from 'react';

const Spinner = () => {
    return (React.createElement("svg", { className: "animate-spin mr-0.5 h-5 w-5 text-blue-500", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
        React.createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
        React.createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })));
};

const CloseIcon = ({ className = "" }) => {
    return (React.createElement("svg", { className: className, fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg" },
        React.createElement("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" })));
};
const ChevronIcon = ({ className = "" }) => {
    return (React.createElement("svg", { className: className, fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg" },
        React.createElement("path", { fillRule: "evenodd", d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z", clipRule: "evenodd" })));
};
const SearchIcon = ({ className = "" }) => {
    return (React.createElement("svg", { className: className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg" },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })));
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

const SearchInput = ({ placeholder = "", value = "", onChange, name = "" }) => {
    return (React.createElement("div", { className: "relative py-1 px-2.5" },
        React.createElement(SearchIcon, { className: "absolute w-5 h-5 mt-2.5 pb-0.5 ml-2 text-gray-500" }),
        React.createElement("input", { className: "w-full py-2 pl-8 text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded focus:border-gray-200 focus:ring-0 focus:outline-none", type: "text", placeholder: placeholder, value: value, onChange: onChange, name: name })));
};

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

const Select = ({ options = [], value = null, onChange, placeholder = "Select...", searchInputPlaceholder = "Search...", isMultiple = false, isClearable = false, isSearchable = false, isDisabled = false, loading = false, menuIsOpen = false, noOptionsMessage = "No options found" }) => {
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
    const onPressEnterOrSpace = useCallback((e) => {
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
                onChange(value === null ? [selected] : [...value, selected]);
            }
        }
        if (selected !== value) {
            update();
        }
    }, [closeDropDown, isMultiple, onChange, value]);
    const clearValue = useCallback((e) => {
        e.stopPropagation();
        onChange(null);
    }, [onChange]);
    const removeItem = useCallback((e, item) => {
        if (isMultiple && Array.isArray(value) && value.length) {
            e.stopPropagation();
            const result = value.filter(current => item.value !== current.value);
            onChange(result.length ? result : null);
        }
    }, [isMultiple, onChange, value]);
    return (React.createElement(SelectProvider, { value: value, handleValueChange: handleValueChange },
        React.createElement("div", { className: "relative w-full", ref: ref },
            React.createElement("div", { tabIndex: 0, "aria-expanded": open, onKeyDown: onPressEnterOrSpace, onClick: toggle, className: `flex text-sm text-gray-500 border border-gray-300 rounded shadow-sm transition duration-300 focus:outline-none${isDisabled ? ' bg-gray-200' : ' bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500'}` },
                React.createElement("div", { className: "grow pl-2.5 py-2 pr-2 flex flex-wrap gap-1" }, !isMultiple ? (React.createElement("p", { className: "truncate cursor-default select-none" }, (value && !Array.isArray(value)) ? value.label : placeholder)) : (React.createElement(React.Fragment, null,
                    value === null && placeholder,
                    Array.isArray(value) && (value.map((item, index) => (React.createElement("div", { className: `bg-gray-200 border rounded-sm flex space-x-1${isDisabled ? ' border-gray-500 px-1' : ' pl-1'}`, key: index },
                        React.createElement("p", { className: "text-gray-600 truncate cursor-default select-none" }, item.label),
                        !isDisabled && (React.createElement("div", { onClick: e => removeItem(e, item), className: `flex items-center px-1 cursor-pointer rounded-r-sm hover:bg-red-200 hover:text-red-600` },
                            React.createElement(CloseIcon, { className: "w-3 h-3 mt-0.5" })))))))))),
                React.createElement("div", { className: "flex flex-none items-center py-1.5" },
                    loading && (React.createElement("div", { className: "px-1.5" },
                        React.createElement(Spinner, null))),
                    (isClearable && !isDisabled && value !== null) && (React.createElement("div", { className: "px-1.5 cursor-pointer", onClick: clearValue },
                        React.createElement(CloseIcon, { className: "w-5 h-5 p-0.5" }))),
                    React.createElement("div", { className: "h-full" },
                        React.createElement("span", { className: "w-px h-full inline-block text-white bg-gray-300 text-opacity-0" })),
                    React.createElement("div", { className: "px-1.5" },
                        React.createElement(ChevronIcon, { className: `transition duration-300 w-6 h-6 p-0.5${open ? ' transform rotate-90 text-gray-500' : ' text-gray-300'}` })))),
            (open && !isDisabled) && (React.createElement("div", { tabIndex: -1, className: "top-[120] z-[100] sm:ml-[15%] md:ml-[30%] max-w-md fixed inset-x-0 bottom-0 w-full bg-white shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700" },
                isSearchable && (React.createElement(SearchInput, { value: inputValue, placeholder: searchInputPlaceholder, onChange: e => setInputValue(e.target.value) })),
                React.createElement(Options, { list: list, noOptionsMessage: noOptionsMessage, text: inputValue, isMultiple: isMultiple, value: value }))))));
};

export { Select as default };
//# sourceMappingURL=index.esm.js.map
