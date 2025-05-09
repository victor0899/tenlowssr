export interface NavbarItems {
    label: string;
    route: string;
    isOpen?: boolean;
}

export interface TabItem extends NavbarItems {
    icon: string;
}

export interface SocialItem {
    icon: string;
    url: string;
}

export interface DetailsItems {
    title: string;
    description: string;
    image: string;
}

export interface CategorieItem {
    name: string;
    image: string;
}
export interface LanguageApi {
    lang: string;
    languages: LanguageData[];
}

export interface LanguageData {
    code: string;
    name: string;
}

export interface AccountOptionItem {
    title: string;
    description: string;
    route: string;
}

export interface DialogData {
    /**
     * Here should enter a translation key.
     */
    title?: string;
    /**
     * Here should enter a translation key.
     */
    msg: string;
}

export interface NotificationToggle {
    label: string;
    value: boolean;
}

export interface PaginatorInfo {
    count:        number;
    currentPage:  number;
    firstItem:    number;
    hasMorePages: boolean;
    lastItem:     number;
    lastPage:     number;
    perPage:      number;
    total:        number;
    __typename:   string;
}

export interface Photo {
    /**
     * The base64 encoded string representation of the image, if using CameraResultType.Base64.
     *
     * @since 1.0.0
     */
    base64String?: string;
    /**
     * The url starting with 'data:image/jpeg;base64,' and the base64 encoded string representation of the image, if using CameraResultType.DataUrl.
     *
     * @since 1.0.0
     */
    dataUrl?: string;
    /**
     * If using CameraResultType.Uri, the path will contain a full,
     * platform-specific file URL that can be read later using the Filesystem API.
     *
     * @since 1.0.0
     */
    path?: string;
    /**
     * webPath returns a path that can be used to set the src attribute of an image for efficient
     * loading and rendering.
     *
     * @since 1.0.0
     */
    webPath?: string;
    /**
     * Exif data, if any, retrieved from the image
     *
     * @since 1.0.0
     */
    exif?: any;
    /**
     * The format of the image, ex: jpeg, png, gif.
     *
     * iOS and Android only support jpeg.
     * Web supports jpeg and png. gif is only supported if using file input.
     *
     * @since 1.0.0
     */
    format: string;
    /**
     * Whether if the image was saved to the gallery or not.
     *
     * On Android and iOS, saving to the gallery can fail if the user didn't
     * grant the required permissions.
     * On Web there is no gallery, so always returns false.
     *
     * @since 1.1.0
     */
    saved: boolean;
}


export interface InfoItem {
    title: string;
    subtitle: string;
    image: string;
}

export interface ParamModalConfirm {
    title: string;
    title2?: string;
    msg: string;
    txtOk?: string;
    txtCancel?: string;
}


export enum TypeShared {
    profile = "profile",
    product = "producto"
}

export type TypeCancelRental = 'change_opinion' | 'item_unavailable' | 'personal_issue' | 'item_damage' | 'others';

export interface OptionCancelRental {
    label: string;
    value: TypeCancelRental;
}

export interface ParamModalRating {
    product_id:     string;
    owner_user_id:  string;
}

export interface RatingProductParams {
    product_id:     string;
    comment:        string;
    rating:         number;
}
export interface RatingOwnerParams {
    owner_user_id:  string;
    comment:        string;
    rating:         number;
}

export type TypePrivacy = 'privacy' | 'cookies' | 'legal';

export interface CookieInfo {
    name: string;
    description: string;
    provider:string;
}


export interface NotificationEvent {
    isReduce: boolean;
    total: number;
}