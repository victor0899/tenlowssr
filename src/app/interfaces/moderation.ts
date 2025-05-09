export enum ReasonType {
    not_show_up = "not_show_up",
    bad_behavior = "bad_behavior",
    defective_item = "defective_item",
    others = "others"
}

export interface OptionReport {
    label: string;
    value: ReasonReport;
    icon: string;
}

export type ReasonReport = 'not_show_up' | 'bad_behavior' | 'defective_item' | 'others';

export interface BlockedUser {
    id:               string;
    blocking_user_id: string;
    blocked_user_id:  string;
    blocking:         Block;
    blocked:          Block;
    __typename:       string;
}

export interface Block {
    id:         string;
    name:       string;
    last_name:  string;
    __typename: string;
}
