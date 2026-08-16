import type { Metadata } from "next";
import { site } from "@/data/site";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { getServerDictionary } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/locales";

export const metadata: Metadata = buildMetadata({
  title: "Returns & Exchanges",
  description: "Return and exchange policy for Max & Lizzy toys purchased online or in-store.",
  pathname: "/policies/returns",
});

const content: Record<
  Locale,
  { title: string; updated: string; sections: { heading: string; body: React.ReactNode }[] }
> = {
  en: {
    title: "Returns & Exchanges",
    updated: "Last updated: July 18, 2026",
    sections: [
      {
        heading: "14-day returns",
        body: "We want you and your child to love every toy from Max & Lizzy. You may return unused, unopened items in their original packaging within 14 days of purchase (or of delivery, for online orders) for a full refund or exchange. If you bought online, this window also reflects your legal right under Armenian consumer protection law, and you do not need to give us a reason.",
      },
      {
        heading: "How to return an item",
        body: "All returns and exchanges must be brought in person to our store at 50 Mashtots Avenue during business hours, along with proof of purchase (an order confirmation email or receipt). This applies to online orders as well, including those delivered to you. We do not accept returns sent by courier or mail, since our staff need to inspect each item in person before approving a refund or exchange.",
      },
      {
        heading: "Damaged or defective items",
        body: (
          <>
            If an item arrives damaged or defective, please let us know within 14 days of receiving your order.
            Contact us first so we can review the issue: by phone, WhatsApp, or Viber at{" "}
            <a href={site.phoneHref} className="underline">
              {site.phone}
            </a>
            , by message on{" "}
            <a href={site.social.instagram} className="underline" target="_blank" rel="noreferrer">
              Instagram
            </a>{" "}
            or{" "}
            <a href={site.social.facebook} className="underline" target="_blank" rel="noreferrer">
              Facebook
            </a>
            , or by visiting the store in person. Once we have confirmed the issue, visit us in store for a
            replacement or full refund at no cost to you.
          </>
        ),
      },
      {
        heading: "Non-returnable items",
        body: "For hygiene reasons, opened bath toys, teethers, and plush items cannot be returned unless defective.",
      },
      {
        heading: "Refunds",
        body: "Approved refunds are issued to your original payment method (Idram or ArCa) and typically appear within 5–10 business days, depending on your bank or wallet provider.",
      },
    ],
  },
  hy: {
    title: "Վերադարձներ և փոխանակումներ",
    updated: "Վերջին թարմացումը՝ 18 հուլիսի, 2026թ.",
    sections: [
      {
        heading: "14-օրյա վերադարձ",
        body: "Մենք ցանկանում ենք, որ Դուք և Ձեր երեխան սիրեք Max & Lizzy-ի յուրաքանչյուր խաղալիք։ Դուք կարող եք վերադարձնել չօգտագործված, չբացված իրերը՝ իրենց սկզբնական փաթեթավորմամբ, գնումից (կամ առցանց պատվերների դեպքում՝ առաքումից) հետո 14 օրվա ընթացքում՝ ամբողջական վերադարձի կամ փոխանակման համար։ Եթե Դուք գնել եք առցանց, այս ժամկետը նաև արտացոլում է Ձեր օրինական իրավունքը՝ ըստ Հայաստանի սպառողների պաշտպանության մասին օրենսդրության, և Դուք պատճառաբանել պարտավոր չեք։",
      },
      {
        heading: "Ինչպես վերադարձնել իրը",
        body: "Բոլոր վերադարձներն ու փոխանակումները պետք է անձամբ բերվեն մեր խանութ՝ 50 Մաշտոցի պողոտա հասցեով, աշխատանքային ժամերին, գնման փաստը հաստատող փաստաթղթի հետ միասին (պատվերի հաստատման նամակ կամ անդորրագիր)։ Սա վերաբերում է նաև առցանց պատվերներին, այդ թվում՝ Ձեզ առաքվածներին։ Մենք չենք ընդունում կուրիերով կամ փոստով ուղարկված վերադարձներ, քանի որ մեր աշխատակիցները պետք է անձամբ զննեն յուրաքանչյուր իր՝ նախքան վերադարձը կամ փոխանակումը հաստատելը։",
      },
      {
        heading: "Վնասված կամ թերի իրեր",
        body: (
          <>
            Եթե իրը հասնում է վնասված կամ թերի, խնդրում ենք տեղեկացնել մեզ Ձեր պատվերը ստանալուց հետո 14 օրվա
            ընթացքում։ Նախ կապվեք մեզ հետ, որպեսզի կարողանանք ուսումնասիրել խնդիրը՝ հեռախոսով, WhatsApp-ով կամ
            Viber-ով{" "}
            <a href={site.phoneHref} className="underline">
              {site.phone}
            </a>{" "}
            համարով, հաղորդագրությամբ{" "}
            <a href={site.social.instagram} className="underline" target="_blank" rel="noreferrer">
              Instagram-ում
            </a>{" "}
            կամ{" "}
            <a href={site.social.facebook} className="underline" target="_blank" rel="noreferrer">
              Facebook-ում
            </a>
            , կամ անձամբ այցելելով խանութ։ Խնդիրը հաստատելուց հետո այցելեք մեզ խանութ՝ փոխարինման կամ ամբողջական
            վերադարձի համար, առանց որևէ ծախսի Ձեզ համար։
          </>
        ),
      },
      {
        heading: "Չվերադարձվող իրեր",
        body: "Հիգիենիկ նկատառումներով՝ բացված լոգանքի խաղալիքները, ատամնահեղույսները և փափուկ խաղալիքները չեն վերադարձվում, եթե չեն թերի։",
      },
      {
        heading: "Փոխհատուցումներ",
        body: "Հաստատված վերադարձները փոխանցվում են Ձեր սկզբնական վճարման միջոցին (Idram կամ ArCa) և սովորաբար երևում են 5–10 աշխատանքային օրվա ընթացքում՝ կախված Ձեր բանկից կամ դրամապանակի մատակարարից։",
      },
    ],
  },
  ru: {
    title: "Возврат и обмен",
    updated: "Последнее обновление: 18 июля 2026 г.",
    sections: [
      {
        heading: "Возврат в течение 14 дней",
        body: "Мы хотим, чтобы вы и ваш ребёнок полюбили каждую игрушку от Max & Lizzy. Вы можете вернуть неиспользованные, нераспечатанные товары в оригинальной упаковке в течение 14 дней с момента покупки (или доставки — для онлайн-заказов) для полного возврата средств или обмена. Если вы совершили покупку онлайн, этот срок также отражает ваше законное право согласно законодательству Республики Армения о защите прав потребителей, и вам не нужно указывать причину.",
      },
      {
        heading: "Как оформить возврат",
        body: "Все возвраты и обмены необходимо приносить лично в наш магазин по адресу проспект Маштоца, 50, в часы работы, вместе с подтверждением покупки (письмо с подтверждением заказа или чек). Это относится и к онлайн-заказам, включая доставленные вам. Мы не принимаем возвраты, отправленные курьером или почтой, поскольку наши сотрудники должны лично осмотреть каждый товар перед одобрением возврата или обмена.",
      },
      {
        heading: "Повреждённые или бракованные товары",
        body: (
          <>
            Если товар пришёл повреждённым или бракованным, сообщите нам об этом в течение 14 дней с момента
            получения заказа. Сначала свяжитесь с нами, чтобы мы могли рассмотреть проблему: по телефону, WhatsApp
            или Viber{" "}
            <a href={site.phoneHref} className="underline">
              {site.phone}
            </a>
            , сообщением в{" "}
            <a href={site.social.instagram} className="underline" target="_blank" rel="noreferrer">
              Instagram
            </a>{" "}
            или{" "}
            <a href={site.social.facebook} className="underline" target="_blank" rel="noreferrer">
              Facebook
            </a>
            , или посетив магазин лично. После подтверждения проблемы посетите наш магазин для замены или полного
            возврата средств без каких-либо расходов с вашей стороны.
          </>
        ),
      },
      {
        heading: "Товары, не подлежащие возврату",
        body: "По гигиеническим причинам распечатанные игрушки для ванной, прорезыватели и мягкие игрушки не подлежат возврату, если они не бракованы.",
      },
      {
        heading: "Возврат средств",
        body: "Одобренные возвраты оформляются на исходный способ оплаты (Idram или ArCa) и обычно поступают в течение 5–10 рабочих дней, в зависимости от вашего банка или платёжной системы.",
      },
    ],
  },
};

export default async function ReturnsPolicyPage() {
  const { locale } = await getServerDictionary();
  const t = content[locale];

  return (
    <Container className="max-w-3xl py-12">
      <h1 className="text-4xl font-bold text-espresso">{t.title}</h1>
      <p className="mt-2 text-sm text-espresso/70">{t.updated}</p>

      <div className="mt-8 space-y-6 text-espresso/80">
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
