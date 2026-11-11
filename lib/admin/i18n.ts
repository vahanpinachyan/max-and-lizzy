import "server-only";
import { cookies } from "next/headers";
import { LOCALE_COOKIE } from "@/lib/i18n/locales";
import type { OrderStatus } from "@/lib/order-status";

// Admin-panel-only locale toggle for staff (separate concern from the
// customer-facing site's en/hy/ru system, but deliberately reuses its same
// cookie — one browser, one language preference, whether someone's looking
// at the storefront or signed into /admin). Only en/hy are offered here
// since staff don't need Russian for internal tools; a stored "ru" value
// just falls back to English.
export type AdminLocale = "en" | "hy";

export async function getAdminLocale(): Promise<AdminLocale> {
  const store = await cookies();
  return store.get(LOCALE_COOKIE)?.value === "hy" ? "hy" : "en";
}

export interface AdminDictionary {
  nav: {
    dashboard: string;
    orders: string;
    customers: string;
    products: string;
    promoCodes: string;
    reviews: string;
    staff: string;
    backToStore: string;
    signOut: string;
  };
  lowStockBanner: (count: number) => string;
  login: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    signIn: string;
    signingIn: string;
  };
  orderStatus: Record<OrderStatus, string>;
  ordersList: {
    title: (count: number) => string;
    filterAll: string;
    noOrders: string;
    colOrder: string;
    colCustomer: string;
    colItems: string;
    colTotal: string;
    colFulfillment: string;
    colStatus: string;
    colPlaced: string;
  };
  orderDetail: {
    allOrders: string;
    orderLabel: string;
    placed: string;
    customer: string;
    viewCustomerHistory: string;
    fulfillment: string;
    notSpecified: string;
    deliverTo: string;
    promoCodeUsed: string;
    giftWrapRequested: string;
    customerNote: string;
    item: string;
    sku: string;
    qty: string;
    price: string;
    total: string;
    giftWrapFeeLine: string;
    resendStatusEmail: string;
    sending: string;
    emailSent: string;
    emailNotSent: string;
    confirmChangeStatusPrefix: string;
    confirmChangeStatusSuffix: string;
    confirm: string;
    cancel: string;
    updating: string;
    statusUpdatedNotified: string;
    statusUpdatedNoEmail: string;
  };
  // Every value here is a plain string, deliberately. This object is handed
  // to BulkProductsTable, a Client Component, and React cannot serialize a
  // function across that boundary — a `(n) => ...` entry fails at request time
  // with "Functions cannot be passed directly to Client Components", not at
  // build time. Counts and names go in as {placeholders} and are filled with
  // interpolate() at the call site.
  productsList: {
    title: string;
    titleFiltered: string;
    addProduct: string;
    filterAll: string;
    filterLowStock: string;
    filterOutOfStock: string;
    filterSaleScheduled: string;
    saleActiveUntil: string;
    saleActiveOpen: string;
    saleScheduledFrom: string;
    selectedCount: string;
    clearSelection: string;
    price: string;
    priceSetTo: string;
    priceAdjustPercent: string;
    pricePutOnSale: string;
    pricePlaceholderSet: string;
    pricePlaceholderAdjust: string;
    pricePlaceholderSale: string;
    applyPrice: string;
    startSale: string;
    endSale: string;
    scheduledSale: string;
    percentOff: string;
    from: string;
    to: string;
    schedule: string;
    cancelScheduled: string;
    tag: string;
    tagAdd: string;
    tagRemove: string;
    applyTag: string;
    searchPlaceholder: string;
    searchAria: string;
    searchResults: string;
    clear: string;
    pageAllSelected: string;
    selectAllMatching: string;
    selectAllAria: string;
    colProduct: string;
    colSku: string;
    colCategory: string;
    colPrice: string;
    colStock: string;
    colFlags: string;
    inStock: string;
    outOfStock: string;
    lowStockLeft: string;
    edit: string;
    deleteLabel: string;
    deleteConfirm: string;
    noMatches: string;
    previous: string;
    next: string;
    showingRange: string;
    pageOf: string;
    flagFeatured: string;
    flagBestseller: string;
    flagNew: string;
    flagSale: string;
    flagMaxPick: string;
    flagLizzyPick: string;
    addFlagAria: string;
    csvToggle: string;
    csvHelp: string;
    csvDownloadTemplate: string;
    csvExcelNote: string;
    csvImport: string;
    csvImporting: string;
    csvRow: string;
  };
}

const en: AdminDictionary = {
  nav: {
    dashboard: "Dashboard",
    orders: "Orders",
    customers: "Customers",
    products: "Products",
    promoCodes: "Promo Codes",
    reviews: "Reviews",
    staff: "Staff",
    backToStore: "← Back to store",
    signOut: "Sign out",
  },
  lowStockBanner: (count) => `⚠ ${count} product${count === 1 ? "" : "s"} running low on stock — review inventory`,
  login: {
    title: "Max & Lizzy Admin",
    subtitle: "Sign in to manage products, stock, and promo codes.",
    email: "Email",
    password: "Password",
    signIn: "Sign In",
    signingIn: "Signing in…",
  },
  orderStatus: {
    pending: "Pending",
    ready_for_pickup: "Ready for pickup",
    shipped: "Shipped",
    completed: "Completed",
    cancelled: "Cancelled",
  },
  ordersList: {
    title: (count) => `Orders (${count})`,
    filterAll: "All",
    noOrders: "No orders yet.",
    colOrder: "Order",
    colCustomer: "Customer",
    colItems: "Items",
    colTotal: "Total",
    colFulfillment: "Fulfillment",
    colStatus: "Status",
    colPlaced: "Placed",
  },
  orderDetail: {
    allOrders: "← All orders",
    orderLabel: "Order",
    placed: "Placed",
    customer: "Customer",
    viewCustomerHistory: "View customer history →",
    fulfillment: "Fulfillment",
    notSpecified: "Not specified",
    deliverTo: "Deliver to",
    promoCodeUsed: "Promo code used",
    giftWrapRequested: "Gift wrapping requested",
    customerNote: "Customer note",
    item: "Item",
    sku: "SKU",
    qty: "Qty",
    price: "Price",
    total: "Total",
    giftWrapFeeLine: "Gift wrapping",
    resendStatusEmail: "Resend status email",
    sending: "Sending…",
    emailSent: "Email sent.",
    emailNotSent: "Email not sent.",
    confirmChangeStatusPrefix: "Change status to",
    confirmChangeStatusSuffix: "? This will automatically email the customer.",
    confirm: "Confirm",
    cancel: "Cancel",
    updating: "Updating…",
    statusUpdatedNotified: "Status updated and customer notified.",
    statusUpdatedNoEmail: "Status updated, but the email wasn't sent",
  },
  productsList: {
    title: "Products ({total})",
    titleFiltered: "Products ({shown} of {total})",
    addProduct: "+ Add Product",
    filterAll: "All",
    filterLowStock: "Low stock",
    filterOutOfStock: "Out of stock",
    filterSaleScheduled: "On sale",
    saleActiveUntil: "{percent}% off until {date}",
    saleActiveOpen: "{percent}% off, no end date",
    saleScheduledFrom: "{percent}% off from {date}",
    selectedCount: "{n} selected",
    clearSelection: "Clear selection",
    price: "Price",
    priceSetTo: "Set to (AMD)",
    priceAdjustPercent: "Adjust by (%)",
    pricePutOnSale: "Put on sale (% off)",
    pricePlaceholderSet: "e.g. 12000",
    pricePlaceholderAdjust: "e.g. -10 or 15",
    pricePlaceholderSale: "e.g. 20",
    applyPrice: "Apply price",
    startSale: "Start sale",
    endSale: "End sale",
    scheduledSale: "Scheduled sale",
    percentOff: "% off",
    from: "From",
    to: "To",
    schedule: "Schedule",
    cancelScheduled: "Cancel scheduled",
    tag: "Tag",
    tagAdd: "Add",
    tagRemove: "Remove",
    applyTag: "Apply tag",
    searchPlaceholder: "Search by product name or SKU",
    searchAria: "Search products by name or SKU",
    searchResults: "{shown} of {total}",
    clear: "Clear",
    pageAllSelected: "All {n} products on this page are selected.",
    selectAllMatching: "Select all {n} matching products",
    selectAllAria: "Select all products on this page",
    colProduct: "Product",
    colSku: "SKU",
    colCategory: "Category",
    colPrice: "Price",
    colStock: "Stock",
    colFlags: "Flags",
    inStock: "In stock",
    outOfStock: "Out of stock",
    lowStockLeft: "⚠ Low stock — {n} left",
    edit: "Edit",
    deleteLabel: "Delete",
    deleteConfirm: "Delete \"{name}\"? This can't be undone.",
    noMatches: "No products match “{query}”. Try part of the name, or the SKU from the box.",
    previous: "← Previous",
    next: "Next →",
    showingRange: "Showing {from}–{to} of {total}",
    pageOf: "(page {page} of {total})",
    flagFeatured: "Featured",
    flagBestseller: "Bestseller",
    flagNew: "New",
    flagSale: "Sale",
    flagMaxPick: "Max's Pick",
    flagLizzyPick: "Lizzy's Pick",
    addFlagAria: "Add tag",
    csvToggle: "Import products from CSV",
    csvHelp: "Upload a CSV file to create or update products in bulk — matched by \"slug\", so re-uploading the same file updates existing products instead of duplicating them.",
    csvDownloadTemplate: "Download the template",
    csvExcelNote: "to see the expected columns. Have an Excel workbook? Save/export it as CSV first (File → Save As → CSV in Excel, or File → Download → CSV in Google Sheets).",
    csvImport: "Import",
    csvImporting: "Importing…",
    csvRow: "Row {row}: {reason}",
  },
};

const hy: AdminDictionary = {
  nav: {
    dashboard: "Վահանակ",
    orders: "Պատվերներ",
    customers: "Հաճախորդներ",
    products: "Ապրանքներ",
    promoCodes: "Պրոմոկոդեր",
    reviews: "Կարծիքներ",
    staff: "Անձնակազմ",
    backToStore: "← Վերադառնալ կայք",
    signOut: "Դուրս գալ",
  },
  lowStockBanner: (count) => `⚠ ${count} ապրանք${count === 1 ? "ի" : "ների"} պաշար քիչ է մնացել — ստուգեք պահեստը`,
  login: {
    title: "Max & Lizzy Ադմին",
    subtitle: "Մուտք գործեք ապրանքները, պաշարը և պրոմոկոդերը կառավարելու համար։",
    email: "Էլ. փոստ",
    password: "Գաղտնաբառ",
    signIn: "Մուտք",
    signingIn: "Մուտք է կատարվում…",
  },
  orderStatus: {
    pending: "Սպասման մեջ",
    ready_for_pickup: "Պատրաստ է ստացման համար",
    shipped: "Առաքվել է",
    completed: "Ավարտված",
    cancelled: "Չեղարկված",
  },
  ordersList: {
    title: (count) => `Պատվերներ (${count})`,
    filterAll: "Բոլորը",
    noOrders: "Դեռ պատվերներ չկան։",
    colOrder: "Պատվեր",
    colCustomer: "Հաճախորդ",
    colItems: "Ապրանքներ",
    colTotal: "Ընդամենը",
    colFulfillment: "Առաքում",
    colStatus: "Կարգավիճակ",
    colPlaced: "Ամսաթիվ",
  },
  orderDetail: {
    allOrders: "← Բոլոր պատվերները",
    orderLabel: "Պատվեր",
    placed: "Ամսաթիվ",
    customer: "Հաճախորդ",
    viewCustomerHistory: "Դիտել հաճախորդի պատմությունը →",
    fulfillment: "Առաքում",
    notSpecified: "Նշված չէ",
    deliverTo: "Առաքման հասցե",
    promoCodeUsed: "Կիրառված պրոմոկոդ",
    giftWrapRequested: "Պատվիրված է նվեր փաթեթավորում",
    customerNote: "Հաճախորդի նշում",
    item: "Ապրանք",
    sku: "Կոդ",
    qty: "Քանակ",
    price: "Գին",
    total: "Ընդամենը",
    giftWrapFeeLine: "Նվեր փաթեթավորում",
    resendStatusEmail: "Կրկին ուղարկել կարգավիճակի նամակը",
    sending: "Ուղարկվում է…",
    emailSent: "Նամակն ուղարկվել է։",
    emailNotSent: "Նամակը չի ուղարկվել։",
    confirmChangeStatusPrefix: "Փոխե՞լ կարգավիճակը՝",
    confirmChangeStatusSuffix: ": Հաճախորդին ավտոմատ կուղարկվի էլ. նամակ։",
    confirm: "Հաստատել",
    cancel: "Չեղարկել",
    updating: "Թարմացվում է…",
    statusUpdatedNotified: "Կարգավիճակը թարմացվեց, հաճախորդին տեղեկացվել է։",
    statusUpdatedNoEmail: "Կարգավիճակը թարմացվեց, բայց նամակը չուղարկվեց",
  },
  productsList: {
    title: "Ապրանքներ ({total})",
    titleFiltered: "Ապրանքներ ({shown} {total}-ից)",
    addProduct: "+ Ավելացնել ապրանք",
    filterAll: "Բոլորը",
    filterLowStock: "Քիչ պաշար",
    filterOutOfStock: "Առկա չէ",
    filterSaleScheduled: "Զեղչված",
    saleActiveUntil: "{percent}% զեղչ մինչև {date}",
    saleActiveOpen: "{percent}% զեղչ, առանց ավարտի ամսաթվի",
    saleScheduledFrom: "{percent}% զեղչ {date}-ից",
    selectedCount: "Ընտրված է {n} ապրանք",
    clearSelection: "Մաքրել ընտրությունը",
    price: "Գին",
    priceSetTo: "Սահմանել (դրամ)",
    priceAdjustPercent: "Փոխել (%)",
    pricePutOnSale: "Զեղչել (%)",
    pricePlaceholderSet: "օր.՝ 12000",
    pricePlaceholderAdjust: "օր.՝ -10 կամ 15",
    pricePlaceholderSale: "օր.՝ 20",
    applyPrice: "Կիրառել գինը",
    startSale: "Սկսել զեղչը",
    endSale: "Ավարտել զեղչը",
    scheduledSale: "Պլանավորված զեղչ",
    percentOff: "% զեղչ",
    from: "Սկսած",
    to: "Մինչև",
    schedule: "Պլանավորել",
    cancelScheduled: "Չեղարկել պլանավորվածը",
    tag: "Պիտակ",
    tagAdd: "Ավելացնել",
    tagRemove: "Հեռացնել",
    applyTag: "Կիրառել պիտակը",
    searchPlaceholder: "Որոնել ըստ անվան կամ SKU-ի",
    searchAria: "Որոնել ապրանքներ ըստ անվան կամ SKU-ի",
    searchResults: "{shown} {total}-ից",
    clear: "Մաքրել",
    pageAllSelected: "Այս էջի բոլոր {n} ապրանքներն ընտրված են։",
    selectAllMatching: "Ընտրել բոլոր {n} համապատասխան ապրանքները",
    selectAllAria: "Ընտրել այս էջի բոլոր ապրանքները",
    colProduct: "Ապրանք",
    colSku: "SKU",
    colCategory: "Կատեգորիա",
    colPrice: "Գին",
    colStock: "Պաշար",
    colFlags: "Պիտակներ",
    inStock: "Առկա է",
    outOfStock: "Առկա չէ",
    lowStockLeft: "⚠ Քիչ պաշար — մնացել է {n}",
    edit: "Խմբագրել",
    deleteLabel: "Ջնջել",
    deleteConfirm: "Ջնջե՞լ «{name}»-ը։ Այս գործողությունը հնարավոր չէ հետարկել։",
    noMatches: "«{query}»-ին համապատասխան ապրանք չգտնվեց։ Փորձեք անվան մի մասը կամ SKU-ն։",
    previous: "← Նախորդ",
    next: "Հաջորդ →",
    showingRange: "Ցուցադրվում է {from}–{to} {total}-ից",
    pageOf: "(էջ {page} {total}-ից)",
    flagFeatured: "Ընտրված",
    flagBestseller: "Հիթ վաճառք",
    flagNew: "Նոր",
    flagSale: "Զեղչ",
    flagMaxPick: "Մաքսի ընտրությունը",
    flagLizzyPick: "Լիզզիի ընտրությունը",
    addFlagAria: "Ավելացնել պիտակ",
    csvToggle: "Ներմուծել ապրանքներ CSV-ից",
    csvHelp: "Վերբեռնեք CSV ֆայլ՝ ապրանքները խմբով ստեղծելու կամ թարմացնելու համար․ համեմատումը կատարվում է «slug»-ով, այնպես որ նույն ֆայլը կրկին վերբեռնելը թարմացնում է առկա ապրանքները, այլ ոչ թե կրկնօրինակում դրանք։",
    csvDownloadTemplate: "Ներբեռնել ձևանմուշը",
    csvExcelNote: "՝ ակնկալվող սյունակները տեսնելու համար։ Excel-ի ֆայլ ունե՞ք․ նախ պահպանեք այն CSV ձևաչափով (Excel-ում՝ File → Save As → CSV, Google Sheets-ում՝ File → Download → CSV)։",
    csvImport: "Ներմուծել",
    csvImporting: "Ներմուծվում է…",
    csvRow: "Տող {row}՝ {reason}",
  },
};

export function getAdminDictionary(locale: AdminLocale): AdminDictionary {
  return locale === "hy" ? hy : en;
}
