import { OperationShippingMethod, OperationStatus, OperationType, ProductInfo } from "./store";
import { User } from "./user";

export enum OPERATIONS_TYPE {
    rental = "rental",
    purchase = "purchase",
    sale = "sale"
}

export interface HistoryInfo {
    id:              string;
    product:         ProductInfo;
    status:          OperationStatus;
    amount:          number;
    type:            OperationType;
    init_date:       Date;
    end_date:        Date;
    user:            User;
    shipping_method: OperationShippingMethod;
    __typename:      string;
}