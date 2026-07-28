import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { getServerDictionary } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/locales";

export const metadata: Metadata = buildMetadata({
  title: "Shipping Policy",
  description: "Shipping, pickup, and local delivery information for Max & Lizzy orders in Yerevan.",
  pathname: "/policies/shipping",
});

const content: Record<
  Locale,
  { title: string; updated: string; sections: { heading: string; body: React.ReactNode }[] }
> = {
  en: {
    title: "Shipping & Delivery Policy",
    updated: "Last updated: July 18, 2026",
    sections: [
      {
        heading: "Free in-store pickup",
        body: (
          <>
            Every online order can be picked up free of charge at our store,{" "}
            <strong>50 Mashtots Avenue, Yerevan</strong>, during regular business hours (10:00 AM to 9:00 PM
            daily). Orders are typically ready the same day. Choose &quot;Pickup&quot; at checkout, and we will
            contact you by phone or email once your order is ready for collection.
          </>
        ),
      },
      {
        heading: "Delivery within Yerevan (500 AMD)",
        body: 'Choose "Delivery within Yerevan" at checkout for delivery within 24 hours. This service costs a flat 500 AMD.',
      },
      {
        heading: "Delivery outside Yerevan (from 1,000 AMD)",
        body: "We ship to the rest of Armenia through Haypost courier service, with delivery typically taking 3–5 days. The checkout price starts at 1,000 AMD. The final courier cost depends on the weight of your order; if it exceeds the amount charged at checkout, we will contact you before proceeding.",
      },
      {
        heading: "Gift wrapping",
        body: "Gift wrapping is available for 600 AMD, with an optional custom message. You can add this to any order at checkout.",
      },
      {
        heading: "Order processing time",
        body: "Orders are generally prepared for pickup or delivery within 1–2 business days. You will receive an email confirmation as soon as your order is placed.",
      },
    ],
  },
  hy: {
    title: "Առաքման քաղաքականություն",
    updated: "Վերջին թարմացումը՝ 18 հուլիսի, 2026թ.",
    sections: [
      {
        heading: "Անվճար վերցնում խանութից",
        body: (
          <>
            Ցանկացած առցանց պատվեր կարող եք անվճար վերցնել մեր խանութից՝ <strong>50 Մաշտոցի պողոտա, Երևան</strong>{" "}
            հասցեով, սովորական աշխատանքային ժամերին (10:00-ից 21:00, ամեն օր)։ Պատվերները սովորաբար պատրաստ են
            նույն օրը։ Ընտրեք «Վերցնում» պատվերի ձևակերպման ժամանակ, և մենք կկապվենք Ձեզ հետ հեռախոսով կամ էլ.
            փոստով, երբ Ձեր պատվերը պատրաստ լինի վերցնելու համար։
          </>
        ),
      },
      {
        heading: "Առաքում Երևանում (500 ՀՀ դրամ)",
        body: "Ընտրեք «Առաքում Երևանում» պատվերի ձևակերպման ժամանակ՝ 24 ժամվա ընթացքում առաքման համար։ Այս ծառայությունն արժե ֆիքսված 500 ՀՀ դրամ։",
      },
      {
        heading: "Առաքում Երևանից դուրս (1,000 ՀՀ դրամից)",
        body: "Մենք առաքում ենք Հայաստանի մնացած մասերում Հայփոստի կուրիերային ծառայության միջոցով, առաքումը սովորաբար տևում է 3–5 օր։ Պատվերի ձևակերպման գինը սկսվում է 1,000 ՀՀ դրամից։ Կուրիերի վերջնական արժեքը կախված է Ձեր պատվերի քաշից. եթե այն գերազանցում է պատվերի ձևակերպման ժամանակ գանձված գումարը, մենք կկապվենք Ձեզ հետ նախքան շարունակելը։",
      },
      {
        heading: "Նվերի փաթեթավորում",
        body: "Նվերի փաթեթավորումը հասանելի է 600 ՀՀ դրամով, ընտրովի հատուկ ուղերձով։ Դուք կարող եք ավելացնել սա ցանկացած պատվերի պատվերի ձևակերպման ժամանակ։",
      },
      {
        heading: "Պատվերի մշակման ժամանակ",
        body: "Պատվերները սովորաբար պատրաստվում են վերցնելու կամ առաքման համար 1–2 աշխատանքային օրվա ընթացքում։ Դուք կստանաք էլ. փոստով հաստատում, հենց որ Ձեր պատվերը կատարվի։",
      },
    ],
  },
  ru: {
    title: "Политика доставки",
    updated: "Последнее обновление: 18 июля 2026 г.",
    sections: [
      {
        heading: "Бесплатный самовывоз из магазина",
        body: (
          <>
            Любой онлайн-заказ можно бесплатно забрать из нашего магазина по адресу{" "}
            <strong>проспект Маштоца, 50, Ереван</strong>, в обычные часы работы (с 10:00 до 21:00 ежедневно).
            Заказы обычно готовы в тот же день. Выберите «Самовывоз» при оформлении заказа, и мы свяжемся с вами
            по телефону или электронной почте, как только заказ будет готов к получению.
          </>
        ),
      },
      {
        heading: "Доставка по Еревану (500 AMD)",
        body: "Выберите «Доставка по Еревану» при оформлении заказа для доставки в течение 24 часов. Стоимость этой услуги — фиксированные 500 AMD.",
      },
      {
        heading: "Доставка за пределы Еревана (от 1 000 AMD)",
        body: "Мы доставляем по остальной территории Армении через курьерскую службу Haypost, доставка обычно занимает 3–5 дней. Цена при оформлении заказа начинается от 1 000 AMD. Итоговая стоимость доставки зависит от веса заказа; если она превышает сумму, указанную при оформлении, мы свяжемся с вами перед отправкой.",
      },
      {
        heading: "Подарочная упаковка",
        body: "Подарочная упаковка доступна за 600 AMD, с возможностью добавить персональное сообщение. Вы можете добавить эту услугу к любому заказу при оформлении.",
      },
      {
        heading: "Срок обработки заказа",
        body: "Заказы обычно готовятся к самовывозу или доставке в течение 1–2 рабочих дней. Вы получите подтверждение по электронной почте сразу после оформления заказа.",
      },
    ],
  },
};

export default async function ShippingPolicyPage() {
  const { locale } = await getServerDictionary();
  const t = content[locale];

  return (
    <Container className="max-w-3xl py-12">
      <h1 className="text-4xl font-bold text-espresso">{t.title}</h1>
      <p className="mt-2 text-sm text-espresso/70">{t.updated}</p>

      <div className="prose-content mt-8 space-y-6 text-espresso/80">
        {t.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-bold text-espresso">{section.heading}</h2>
            <p className="mt-2">{section.body}</p>
          </section>
        ))}
      </div>
    </Container>
  );
}
