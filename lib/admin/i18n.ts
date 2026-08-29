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
};

export function getAdminDictionary(locale: AdminLocale): AdminDictionary {
  return locale === "hy" ? hy : en;
}
