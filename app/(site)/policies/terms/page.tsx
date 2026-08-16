import type { Metadata } from "next";
import { site } from "@/data/site";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { getServerDictionary } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/locales";

export const metadata: Metadata = buildMetadata({
  title: "Terms & Conditions",
  description: "Terms and conditions for buying from Max & Lizzy online or in-store.",
  pathname: "/policies/terms",
});

const content: Record<
  Locale,
  { title: string; updated: string; sections: { heading: string; body: React.ReactNode }[] }
> = {
  en: {
    title: "Terms & Conditions",
    updated: "Last updated: July 18, 2026",
    sections: [
      {
        heading: "Who you're buying from",
        body: (
          <>
            {site.name} is operated by <strong>{site.legalName}</strong> ({site.legalNameHy}), a company
            registered in the Republic of Armenia, trading as &quot;{site.name}&quot; from our store at{" "}
            {site.address.street}, {site.address.city}, {site.address.country}. By placing an order with us,
            whether online or in-store, you&apos;re entering into a contract with {site.legalName}, not with a
            separate &quot;Max &amp; Lizzy&quot; entity.
          </>
        ),
      },
      {
        heading: "Products & pricing",
        body: "All prices on the site are listed in Armenian dram (AMD) and include any applicable taxes unless stated otherwise. We work to keep product photos, descriptions, and stock levels accurate, but occasionally a listing may contain an error. If we catch a pricing or availability mistake after you have ordered, we will contact you before charging or fulfilling anything.",
      },
      {
        heading: "Orders & payment",
        body: "Placing an order is an offer to buy, which we accept once payment is confirmed. Online payments are processed securely through our payment providers, Idram and ArCa. We never see or store your full card number or wallet credentials. An order is only confirmed once you receive an order confirmation email.",
      },
      {
        heading: "Delivery & pickup",
        body: (
          <>
            See our{" "}
            <a href="/policies/shipping" className="underline">
              Shipping &amp; Delivery Policy
            </a>{" "}
            for pickup and local delivery details.
          </>
        ),
      },
      {
        heading: "Returns & cancellations",
        body: (
          <>
            If you bought online, Armenian law gives you the right to cancel your order and return it within 14
            days of receiving it, without needing to give a reason. See our{" "}
            <a href="/policies/returns" className="underline">
              Returns &amp; Exchanges policy
            </a>{" "}
            for how to use this right and what isn&apos;t eligible for return.
          </>
        ),
      },
      {
        heading: "Product safety & warranty",
        body: "We only sell toys tested to recognized safety standards for their stated age range. If a toy arrives faulty, see the Returns & Exchanges policy above. Most items also carry a manufacturer warranty against defects, noted on the product page where it applies.",
      },
      {
        heading: "Limitation of liability",
        body: (
          <>
            To the extent permitted by Armenian law, {site.legalName} is not liable for indirect or consequential
            losses arising from your use of the site or our products, beyond the price you paid for the item in
            question. Nothing in these terms limits any right you have under Armenian consumer protection law that
            can&apos;t lawfully be excluded.
          </>
        ),
      },
      {
        heading: "Intellectual property",
        body: (
          <>
            The {site.name} name, logo, and site content (text, photos, illustrations) belong to {site.legalName}{" "}
            or its licensors and may not be reused without permission. Product photos and trademarks belonging to
            the brands we sell remain the property of their respective owners.
          </>
        ),
      },
      {
        heading: "Governing law",
        body: "These terms are governed by the laws of the Republic of Armenia, and any dispute that can't be resolved directly with us is subject to the jurisdiction of the courts of Armenia.",
      },
      {
        heading: "Changes to these terms",
        body: "We may update these terms from time to time. The \"Last updated\" date at the top of this page reflects the most recent version. Continuing to use the site or place orders after a change means you accept the updated terms.",
      },
      {
        heading: "Contact",
        body: (
          <>
            Questions about these terms? Reach us via our{" "}
            <a href="/contact" className="underline">
              contact page
            </a>
            , by phone at{" "}
            <a href={site.phoneHref} className="underline">
              {site.phone}
            </a>
            , or by email at{" "}
            <a href={`mailto:${site.email}`} className="underline">
              {site.email}
            </a>
            .
          </>
        ),
      },
    ],
  },
  hy: {
    title: "Ծառայության պայմաններ",
    updated: "Վերջին թարմացումը՝ 18 հուլիսի, 2026թ.",
    sections: [
      {
        heading: "Ումից եք գնում",
        body: (
          <>
            {site.name}-ը գործում է <strong>{site.legalNameHy}</strong> ({site.legalName}) ընկերության կողմից,
            որը գրանցված է Հայաստանի Հանրապետությունում և առևտուր է իրականացնում &quot;{site.name}&quot; անվան
            ներքո՝ մեր խանութից՝ {site.address.street}, {site.address.city}, Հայաստան հասցեով։ Մեզանից պատվեր
            կատարելով՝ առցանց կամ խանութում, Դուք կնքում եք պայմանագիր {site.legalNameHy}-ի հետ, ոչ թե որևէ
            առանձին &quot;Max &amp; Lizzy&quot; կազմակերպության հետ։
          </>
        ),
      },
      {
        heading: "Ապրանքներ և գնագոյացում",
        body: "Կայքում նշված բոլոր գները ներկայացված են հայկական դրամով (ՀՀ դրամ) և ներառում են կիրառելի հարկերը, եթե այլ բան նշված չէ։ Մենք աշխատում ենք ապրանքների լուսանկարները, նկարագրությունները և պահեստի քանակները ճշգրիտ պահել, սակայն երբեմն ցանկում կարող է սխալ պատահել։ Եթե պատվերից հետո հայտնաբերենք գնային կամ հասանելիության սխալ, մենք կկապվենք Ձեզ հետ՝ նախքան որևէ գումար գանձելը կամ պատվերը կատարելը։",
      },
      {
        heading: "Պատվերներ և վճարում",
        body: "Պատվեր կատարելը գնման առաջարկ է, որը մենք ընդունում ենք վճարումը հաստատվելուց հետո։ Առցանց վճարումները անվտանգ մշակվում են մեր վճարային գործընկերների՝ Idram-ի և ArCa-ի միջոցով։ Մենք երբեք չենք տեսնում կամ պահպանում Ձեր բանկային քարտի ամբողջական համարը կամ դրամապանակի տվյալները։ Պատվերը հաստատված է համարվում միայն պատվերի հաստատման նամակը ստանալուց հետո։",
      },
      {
        heading: "Առաքում և վերցնում",
        body: (
          <>
            Տեսեք մեր{" "}
            <a href="/policies/shipping" className="underline">
              Առաքման քաղաքականությունը
            </a>{" "}
            խանութից վերցնելու և տեղական առաքման մանրամասների համար։
          </>
        ),
      },
      {
        heading: "Վերադարձներ և չեղարկումներ",
        body: (
          <>
            Եթե Դուք գնել եք առցանց, հայկական օրենսդրությունը Ձեզ իրավունք է տալիս չեղարկել Ձեր պատվերը և
            վերադարձնել այն ստանալուց հետո 14 օրվա ընթացքում՝ առանց պատճառաբանելու։ Տեսեք մեր{" "}
            <a href="/policies/returns" className="underline">
              Վերադարձների և փոխանակումների քաղաքականությունը
            </a>{" "}
            այս իրավունքն օգտագործելու և չվերադարձվող ապրանքների վերաբերյալ։
          </>
        ),
      },
      {
        heading: "Ապրանքի անվտանգություն և երաշխիք",
        body: "Մենք վաճառում ենք միայն այն խաղալիքները, որոնք փորձարկված են ճանաչված անվտանգության ստանդարտներով՝ իրենց նշված տարիքային խմբի համար։ Եթե խաղալիքը հասնում է թերի, տեսեք վերևում նշված Վերադարձների և փոխանակումների քաղաքականությունը։ Շատ ապրանքներ նաև ունեն արտադրողի երաշխիք թերությունների դեմ, նշված ապրանքի էջում, որտեղ կիրառելի է։",
      },
      {
        heading: "Պատասխանատվության սահմանափակում",
        body: (
          <>
            Հայկական օրենսդրությամբ թույլատրված սահմաններում, {site.legalNameHy}-ն պատասխանատվություն չի կրում
            կայքի կամ մեր ապրանքների օգտագործումից բխող անուղղակի կամ հետևանքային կորուստների համար՝ ավելի քան
            այն գումարը, որը Դուք վճարել եք տվյալ ապրանքի համար։ Այս պայմաններից ոչինչ չի սահմանափակում որևէ
            իրավունք, որը Դուք ունեք հայկական սպառողների պաշտպանության մասին օրենսդրության համաձայն և որը
            օրինական ճանապարհով չի կարող բացառվել։
          </>
        ),
      },
      {
        heading: "Մտավոր սեփականություն",
        body: (
          <>
            {site.name} անվանումը, լոգոն և կայքի բովանդակությունը (տեքստ, լուսանկարներ, պատկերազարդումներ)
            պատկանում են {site.legalNameHy}-ին կամ նրա լիցենզատուներին և չեն կարող կրկին օգտագործվել առանց
            թույլտվության։ Մեր վաճառած բրենդներին պատկանող ապրանքների լուսանկարներն ու ապրանքային նշանները
            մնում են իրենց համապատասխան սեփականատերերի սեփականությունը։
          </>
        ),
      },
      {
        heading: "Կիրառելի իրավունք",
        body: "Այս պայմանները կարգավորվում են Հայաստանի Հանրապետության օրենսդրությամբ, և ցանկացած վեճ, որը հնարավոր չէ լուծել ուղղակիորեն մեզ հետ, ենթակա է Հայաստանի դատարանների իրավասությանը։",
      },
      {
        heading: "Փոփոխություններ այս պայմաններում",
        body: "Մենք կարող ենք ժամանակ առ ժամանակ թարմացնել այս պայմանները։ Այս էջի վերևում նշված «Վերջին թարմացումը» ամսաթիվն արտացոլում է ամենավերջին տարբերակը։ Փոփոխությունից հետո կայքն օգտագործելը կամ պատվեր կատարելը շարունակելը նշանակում է, որ Դուք ընդունում եք թարմացված պայմանները։",
      },
      {
        heading: "Կապ",
        body: (
          <>
            Հարցեր ունե՞ք այս պայմանների վերաբերյալ։ Կապվեք մեզ հետ մեր{" "}
            <a href="/contact" className="underline">
              կապի էջի
            </a>{" "}
            միջոցով, հեռախոսով՝{" "}
            <a href={site.phoneHref} className="underline">
              {site.phone}
            </a>
            , կամ էլ. փոստով՝{" "}
            <a href={`mailto:${site.email}`} className="underline">
              {site.email}
            </a>
            ։
          </>
        ),
      },
    ],
  },
  ru: {
    title: "Условия использования",
    updated: "Последнее обновление: 18 июля 2026 г.",
    sections: [
      {
        heading: "У кого вы покупаете",
        body: (
          <>
            {site.name} управляется компанией <strong>{site.legalName}</strong> ({site.legalNameHy}),
            зарегистрированной в Республике Армения и действующей под названием «{site.name}» из нашего магазина
            по адресу: {site.address.street}, {site.address.city}, Армения. Оформляя заказ у нас — онлайн или в
            магазине — вы заключаете договор с {site.legalName}, а не с отдельным юридическим лицом «Max &amp;
            Lizzy».
          </>
        ),
      },
      {
        heading: "Товары и цены",
        body: "Все цены на сайте указаны в армянских драмах (AMD) и включают применимые налоги, если не указано иное. Мы стараемся поддерживать точность фотографий, описаний и наличия товаров, но иногда в объявлении может быть ошибка. Если мы обнаружим ошибку в цене или наличии после оформления заказа, мы свяжемся с вами до списания средств или выполнения заказа.",
      },
      {
        heading: "Заказы и оплата",
        body: "Оформление заказа является предложением о покупке, которое мы принимаем после подтверждения оплаты. Онлайн-платежи безопасно обрабатываются через наших платёжных провайдеров — Idram и ArCa. Мы никогда не видим и не храним полный номер вашей карты или данные электронного кошелька. Заказ считается подтверждённым только после получения письма с подтверждением заказа.",
      },
      {
        heading: "Доставка и самовывоз",
        body: (
          <>
            См. нашу{" "}
            <a href="/policies/shipping" className="underline">
              Политику доставки
            </a>{" "}
            для получения информации о самовывозе и местной доставке.
          </>
        ),
      },
      {
        heading: "Возврат и отмена заказа",
        body: (
          <>
            Если вы совершили покупку онлайн, армянское законодательство даёт вам право отменить заказ и вернуть
            его в течение 14 дней с момента получения без указания причины. См. нашу{" "}
            <a href="/policies/returns" className="underline">
              Политику возврата и обмена
            </a>{" "}
            для информации о том, как воспользоваться этим правом и что не подлежит возврату.
          </>
        ),
      },
      {
        heading: "Безопасность товара и гарантия",
        body: "Мы продаём только игрушки, протестированные на соответствие признанным стандартам безопасности для указанного возрастного диапазона. Если игрушка пришла с браком, см. Политику возврата и обмена выше. На большинство товаров также распространяется гарантия производителя от дефектов, указанная на странице товара, где применимо.",
      },
      {
        heading: "Ограничение ответственности",
        body: (
          <>
            В пределах, допустимых армянским законодательством, {site.legalName} не несёт ответственности за
            косвенные или последующие убытки, возникшие в результате использования вами сайта или наших товаров,
            сверх цены, уплаченной за соответствующий товар. Ничто в этих условиях не ограничивает какие-либо
            права, которые есть у вас согласно законодательству Армении о защите прав потребителей и которые не
            могут быть законно исключены.
          </>
        ),
      },
      {
        heading: "Интеллектуальная собственность",
        body: (
          <>
            Название {site.name}, логотип и содержимое сайта (тексты, фотографии, иллюстрации) принадлежат{" "}
            {site.legalName} или их лицензиарам и не могут быть повторно использованы без разрешения. Фотографии
            товаров и товарные знаки брендов, которые мы продаём, остаются собственностью их соответствующих
            владельцев.
          </>
        ),
      },
      {
        heading: "Применимое право",
        body: "Настоящие условия регулируются законодательством Республики Армения, и любой спор, который не может быть решён напрямую с нами, подлежит юрисдикции судов Армении.",
      },
      {
        heading: "Изменения условий",
        body: "Мы можем время от времени обновлять эти условия. Дата «Последнее обновление» в верхней части страницы отражает самую актуальную версию. Продолжая использовать сайт или оформлять заказы после изменения, вы принимаете обновлённые условия.",
      },
      {
        heading: "Контакты",
        body: (
          <>
            Есть вопросы по этим условиям? Свяжитесь с нами через{" "}
            <a href="/contact" className="underline">
              страницу контактов
            </a>
            , по телефону{" "}
            <a href={site.phoneHref} className="underline">
              {site.phone}
            </a>{" "}
            или по электронной почте{" "}
            <a href={`mailto:${site.email}`} className="underline">
              {site.email}
            </a>
            .
          </>
        ),
      },
    ],
  },
};

export default async function TermsPolicyPage() {
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
