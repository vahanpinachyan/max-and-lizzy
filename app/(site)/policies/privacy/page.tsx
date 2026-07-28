import type { Metadata } from "next";
import { site } from "@/data/site";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { getServerDictionary } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/locales";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How Max & Lizzy collects, uses, and protects your personal information.",
  pathname: "/policies/privacy",
});

const content: Record<
  Locale,
  { title: string; updated: string; sections: { heading: string; body: React.ReactNode }[] }
> = {
  en: {
    title: "Privacy Policy",
    updated: "Last updated: July 18, 2026",
    sections: [
      {
        heading: "Information we collect",
        body: "When you shop with us online, we collect the information necessary to process your order: your name, email address, phone number, delivery address (if applicable), and payment details. Payment information is collected and processed directly by our payment providers, Telcell, Idram, and ArCa. We never see or store your full card number or wallet credentials.",
      },
      {
        heading: "How we use your information",
        body: "We use your information to fulfill and communicate about your order, respond to inquiries submitted through our contact form, and, if you opt in, send occasional newsletter emails with gift guides and play tips. We do not sell your personal information to third parties.",
      },
      {
        heading: "Personal data processing",
        body: "We process your personal data on the legal basis of fulfilling your order (a contract with you) and, for optional newsletter emails, your consent, which you may withdraw at any time. We retain order-related personal data for as long as needed to fulfill your order, comply with our accounting and legal obligations under Armenian law, and handle any warranty or return claims, after which it is deleted or anonymized. We do not use your personal data for any purpose beyond what is described in this policy.",
      },
      {
        heading: "Cookies & analytics",
        body: "Our site may use cookies and analytics tools (such as Google Analytics) to understand how visitors use the site and improve the shopping experience.",
      },
      {
        heading: "Third-party services",
        body: "We share order information with our payment providers (Telcell, Idram, and ArCa) for payment processing, and, where applicable, with our email service provider for order and newsletter emails. This information is shared solely to provide our services to you.",
      },
      {
        heading: "Your rights",
        body: (
          <>
            You may request access to, correction of, or deletion of your personal information at any time by
            contacting us at{" "}
            <a href={`mailto:${site.email}`} className="underline">
              {site.email}
            </a>
            .
          </>
        ),
      },
      {
        heading: "Contact",
        body: (
          <>
            Questions about this policy? Reach us via our{" "}
            <a href="/contact" className="underline">
              contact page
            </a>{" "}
            or visit us at {site.address.street}, {site.address.city}.
          </>
        ),
      },
    ],
  },
  hy: {
    title: "Գաղտնիության քաղաքականություն",
    updated: "Վերջին թարմացումը՝ 18 հուլիսի, 2026թ.",
    sections: [
      {
        heading: "Ինչ տեղեկություններ ենք հավաքում",
        body: "Երբ գնումներ եք կատարում մեզանից առցանց, մենք հավաքում ենք Ձեր պատվերը մշակելու համար անհրաժեշտ տեղեկությունները՝ Ձեր անունը, էլ. փոստի հասցեն, հեռախոսահամարը, առաքման հասցեն (անհրաժեշտության դեպքում) և վճարման տվյալները։ Վճարման տեղեկությունները հավաքվում և մշակվում են անմիջապես մեր վճարային գործընկերների՝ Telcell-ի, Idram-ի և ArCa-ի կողմից։ Մենք երբեք չենք տեսնում կամ պահպանում Ձեր բանկային քարտի ամբողջական համարը կամ դրամապանակի տվյալները։",
      },
      {
        heading: "Ինչպես ենք օգտագործում Ձեր տեղեկությունները",
        body: "Մենք օգտագործում ենք Ձեր տեղեկությունները Ձեր պատվերը կատարելու և դրա մասին Ձեզ հետ կապվելու, Ձեր հետադարձ կապի ձևի միջոցով ուղարկված հարցումներին պատասխանելու, և, եթե Դուք համաձայնվել եք, Ձեզ երբեմն նորությունների նամակներ ուղարկելու համար՝ նվերների ընտրության ուղեցույցներով և խաղի հուշումներով։ Մենք չենք վաճառում Ձեր անձնական տվյալները երրորդ կողմերին։",
      },
      {
        heading: "Անձնական տվյալների մշակում",
        body: "Մենք մշակում ենք Ձեր անձնական տվյալները Ձեր պատվերը կատարելու իրավական հիմքով (Ձեզ հետ կնքված պայմանագիր), իսկ ոչ պարտադիր նորությունների նամակների համար՝ Ձեր համաձայնությամբ, որը Դուք կարող եք ցանկացած պահի հետ կանչել։ Մենք պահպանում ենք պատվերի հետ կապված անձնական տվյալները այնքան ժամանակ, որքան անհրաժեշտ է Ձեր պատվերը կատարելու, ՀՀ օրենսդրությամբ սահմանված հաշվապահական և իրավական պարտավորությունները կատարելու, ինչպես նաև երաշխիքային կամ վերադարձի հայտերը մշակելու համար, որից հետո դրանք ջնջվում կամ անանունացվում են։ Մենք Ձեր անձնական տվյալներն օգտագործում ենք բացառապես այս քաղաքականությամբ նկարագրված նպատակներով։",
      },
      {
        heading: "Cookie ֆայլեր և վերլուծություն",
        body: "Մեր կայքը կարող է օգտագործել cookie ֆայլեր և վերլուծական գործիքներ (օրինակ՝ Google Analytics)՝ հասկանալու համար, թե ինչպես են այցելուները օգտագործում կայքը, և բարելավելու գնումների փորձառությունը։",
      },
      {
        heading: "Երրորդ կողմի ծառայություններ",
        body: "Մենք կիսվում ենք պատվերի տեղեկություններով մեր վճարային գործընկերների հետ (Telcell, Idram և ArCa)՝ վճարումը մշակելու համար, և, անհրաժեշտության դեպքում, մեր էլ. փոստի ծառայության մատակարարի հետ՝ պատվերի և նորությունների նամակների համար։ Այս տեղեկությունը կիսվում է բացառապես Ձեզ մեր ծառայությունները մատուցելու նպատակով։",
      },
      {
        heading: "Ձեր իրավունքները",
        body: (
          <>
            Դուք կարող եք ցանկացած պահի հարցում ներկայացնել Ձեր անձնական տվյալներին հասանելիություն ստանալու,
            դրանք ուղղելու կամ ջնջելու համար՝ կապվելով մեզ հետ{" "}
            <a href={`mailto:${site.email}`} className="underline">
              {site.email}
            </a>{" "}
            հասցեով։
          </>
        ),
      },
      {
        heading: "Կապ",
        body: (
          <>
            Հարցեր ունե՞ք այս քաղաքականության վերաբերյալ։ Կապվեք մեզ հետ մեր{" "}
            <a href="/contact" className="underline">
              կապի էջի
            </a>{" "}
            միջոցով կամ այցելեք մեզ {site.address.street}, {site.address.city}։
          </>
        ),
      },
    ],
  },
  ru: {
    title: "Политика конфиденциальности",
    updated: "Последнее обновление: 18 июля 2026 г.",
    sections: [
      {
        heading: "Какую информацию мы собираем",
        body: "Когда вы совершаете покупки на нашем сайте, мы собираем информацию, необходимую для обработки заказа: ваше имя, адрес электронной почты, номер телефона, адрес доставки (при необходимости) и платёжные данные. Платёжная информация собирается и обрабатывается напрямую нашими платёжными провайдерами — Telcell, Idram и ArCa. Мы никогда не видим и не храним полный номер вашей карты или данные электронного кошелька.",
      },
      {
        heading: "Как мы используем вашу информацию",
        body: "Мы используем вашу информацию для выполнения заказа и связи с вами по его поводу, для ответа на обращения через форму обратной связи, а также, если вы дали согласие, для периодической рассылки писем с подборками подарков и советами по играм. Мы не продаём вашу персональную информацию третьим лицам.",
      },
      {
        heading: "Обработка персональных данных",
        body: "Мы обрабатываем ваши персональные данные на основании выполнения вашего заказа (договор с вами), а для необязательной рассылки — на основании вашего согласия, которое вы можете отозвать в любой момент. Мы храним персональные данные, связанные с заказом, столько времени, сколько необходимо для выполнения заказа, соблюдения бухгалтерских и правовых обязательств согласно законодательству Республики Армения, а также для рассмотрения гарантийных обращений и возвратов, после чего данные удаляются или обезличиваются. Мы не используем ваши персональные данные для каких-либо целей, не указанных в этой политике.",
      },
      {
        heading: "Файлы cookie и аналитика",
        body: "Наш сайт может использовать файлы cookie и аналитические инструменты (например, Google Analytics), чтобы понимать, как посетители используют сайт, и улучшать процесс покупок.",
      },
      {
        heading: "Услуги третьих сторон",
        body: "Мы передаём информацию о заказе нашим платёжным провайдерам (Telcell, Idram и ArCa) для обработки платежа, а также, при необходимости, нашему поставщику услуг электронной почты для отправки писем о заказе и рассылок. Эта информация передаётся исключительно с целью предоставления вам наших услуг.",
      },
      {
        heading: "Ваши права",
        body: (
          <>
            Вы можете в любое время запросить доступ к своей персональной информации, её исправление или удаление,
            связавшись с нами по адресу{" "}
            <a href={`mailto:${site.email}`} className="underline">
              {site.email}
            </a>
            .
          </>
        ),
      },
      {
        heading: "Контакты",
        body: (
          <>
            Есть вопросы по этой политике? Свяжитесь с нами через{" "}
            <a href="/contact" className="underline">
              страницу контактов
            </a>{" "}
            или посетите нас по адресу: {site.address.street}, {site.address.city}.
          </>
        ),
      },
    ],
  },
};

export default async function PrivacyPolicyPage() {
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
