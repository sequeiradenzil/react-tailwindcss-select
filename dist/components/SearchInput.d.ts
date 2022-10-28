import React from 'react';
interface SearchInputProps {
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string;
}
declare const SearchInput: React.FC<SearchInputProps>;
export default SearchInput;
