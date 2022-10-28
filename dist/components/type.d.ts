export interface Option {
    value: string;
    label: string;
    disabled?: boolean;
}
export interface GroupOption {
    label: string;
    options: Option[];
}
export declare type Options = Array<Option | GroupOption>;
