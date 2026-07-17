import type { CategoryInfo } from "@/types";
import { categories as baseCategories } from "@/data/categories";
import { promotions as basePromotions, type Promotion } from "@/data/promotions";
import type { Locale } from "@/lib/i18n/locales";

interface CategoryTranslation {
  name: string;
  shortDescription: string;
  subcategories: Record<string, string>;
}

const categoryTranslations: Record<"hy" | "ru", Record<string, CategoryTranslation>> = {
  hy: {
    educational: {
      name: "Կրթական",
      shortDescription:
        "Խաղալիքներ, որոնք զարգացնում են հմտություններ խաղի միջոցով՝ հաշվել, դասակարգել, լեզու և վաղ ՍՏԵՄ։",
      subcategories: {
        "early-learning": "Վաղ ուսուցում",
        stem: "ՍՏԵՄ և կառուցում",
        "language-literacy": "Լեզու և գրագիտություն",
        "sensory-play": "Զգայական խաղ",
      },
    },
    "wooden-toys": {
      name: "Փայտյա խաղալիքներ",
      shortDescription: "Կայուն ձևով ձեռք բերված զանգվածեղեն փայտից խաղալիքներ, որոնք դիմանում են սերունդներով։",
      subcategories: {
        "stacking-sorting": "Դասավորում և տեսակավորում",
        "push-pull": "Հրել և քաշել",
        "pretend-play": "Երևակայական խաղ",
        musical: "Երաժշտական խաղալիքներ",
      },
    },
    "outdoor-play": {
      name: "Բացօթյա խաղեր",
      shortDescription: "Ակտիվ, երևակայական խաղ բակի, զբոսայգու կամ պատշգամբի համար։",
      subcategories: {
        "ride-on": "Հեծանիվ-խաղալիքներ",
        "sand-water": "Ավազի և ջրի խաղ",
        "active-play": "Ակտիվ խաղ",
      },
    },
    "puzzles-games": {
      name: "Գլուխկոտրուկներ և խաղեր",
      shortDescription: "Խոշոր առաջին գլուխկոտրուկներ և համագործակցային խաղեր աճող մտքերի համար։",
      subcategories: {
        "wooden-puzzles": "Փայտյա գլուխկոտրուկներ",
        "matching-memory": "Զուգորդում և հիշողություն",
        "first-games": "Առաջին խաղեր",
      },
    },
    "baby-toddler": {
      name: "Երեխա և փոքրիկ",
      shortDescription: "Մեղմ, անվտանգ առաջին խաղալիքներ փոքրիկ ձեռքերի համար՝ նորածնից մինչև երեք տարեկան։",
      subcategories: {
        "rattles-teethers": "Զնգոցներ և ատամնահանողներ",
        "first-blocks": "Առաջին խորանարդիկներ",
        "soft-toys": "Փափուկ և պլյուշ խաղալիքներ",
        "bath-toys": "Լոգանքի խաղալիքներ",
      },
    },
  },
  ru: {
    educational: {
      name: "Развивающие",
      shortDescription: "Игрушки, развивающие навыки через игру — счёт, сортировку, речь и раннее STEM-обучение.",
      subcategories: {
        "early-learning": "Раннее обучение",
        stem: "STEM и конструирование",
        "language-literacy": "Речь и грамотность",
        "sensory-play": "Сенсорные игры",
      },
    },
    "wooden-toys": {
      name: "Деревянные игрушки",
      shortDescription: "Игрушки из массива дерева от экологичных источников, которые прослужат не одному поколению.",
      subcategories: {
        "stacking-sorting": "Сортировка и составление",
        "push-pull": "Каталки",
        "pretend-play": "Сюжетно-ролевые игры",
        musical: "Музыкальные игрушки",
      },
    },
    "outdoor-play": {
      name: "Игры на улице",
      shortDescription: "Активные, творческие игры во дворе, парке или на балконе.",
      subcategories: {
        "ride-on": "Каталки и мотоциклы",
        "sand-water": "Игры с песком и водой",
        "active-play": "Активные игры",
      },
    },
    "puzzles-games": {
      name: "Пазлы и игры",
      shortDescription: "Крупные первые пазлы и совместные игры для развития мышления.",
      subcategories: {
        "wooden-puzzles": "Деревянные пазлы",
        "matching-memory": "На память и сопоставление",
        "first-games": "Первые игры",
      },
    },
    "baby-toddler": {
      name: "Малышам",
      shortDescription: "Мягкие, безопасные первые игрушки для маленьких рук — от новорождённых до трёх лет.",
      subcategories: {
        "rattles-teethers": "Погремушки и грызунки",
        "first-blocks": "Первые кубики",
        "soft-toys": "Мягкие и плюшевые игрушки",
        "bath-toys": "Игрушки для ванной",
      },
    },
  },
};

export function localizeCategory(cat: CategoryInfo, locale: Locale): CategoryInfo {
  if (locale === "en") return cat;
  const tr = categoryTranslations[locale][cat.slug];
  if (!tr) return cat;
  return {
    ...cat,
    name: tr.name,
    shortDescription: tr.shortDescription,
    subcategories: cat.subcategories.map((s) => ({ ...s, name: tr.subcategories[s.slug] ?? s.name })),
  };
}

export function localizeCategories(locale: Locale): CategoryInfo[] {
  return baseCategories.map((c) => localizeCategory(c, locale));
}

export function getLocalizedCategory(slug: string, locale: Locale): CategoryInfo | undefined {
  const cat = baseCategories.find((c) => c.slug === slug);
  return cat ? localizeCategory(cat, locale) : undefined;
}

interface PromotionTranslation {
  title: string;
  subtitle: string;
  ctaLabel: string;
}

const promotionTranslations: Record<"hy" | "ru", Record<string, PromotionTranslation>> = {
  hy: {
    "new-stem-arrivals": {
      title: "Նոր՝ ՍՏԵՄ կառուցողական հավաքածուներ",
      subtitle: "Մագնիսական սալիկներ, մարմարե ուղիներ և ավելին հետաքրքրասեր փոքրիկների համար",
      ctaLabel: "Գնել Կրթական",
    },
    "gift-guide-under-15000": {
      title: "Նվերներ մինչև 15,000 դրամ",
      subtitle: "Խորիմաստ նվերներ՝ առանց բյուջեն գերազանցելու",
      ctaLabel: "Տեսնել ուղեցույցը",
    },
    "outdoor-play-season": {
      title: "Անժամանակ փայտյա խաղալիքներ",
      subtitle: "Դասավորում, կառուցում և երևակայական խաղ՝ ստեղծված երկար ծառայելու համար",
      ctaLabel: "Գնել փայտյա խաղալիքներ",
    },
    "visit-yerevan-store": {
      title: "Այցելեք մեզ Մաշտոցի պողոտայում",
      subtitle: "Տեսեք և փորձեք ամեն խաղալիք անձամբ, բաց ենք ամեն օր",
      ctaLabel: "Ուղղություններ",
    },
  },
  ru: {
    "new-stem-arrivals": {
      title: "Новинка: STEM-конструкторы",
      subtitle: "Магнитные плитки, мраморные дорожки и другое для любознательных строителей",
      ctaLabel: "Развивающие игрушки",
    },
    "gift-guide-under-15000": {
      title: "Подарки до 15 000 драм",
      subtitle: "Продуманные подарки, которые не ударят по бюджету",
      ctaLabel: "Смотреть подборку",
    },
    "outdoor-play-season": {
      title: "Деревянные игрушки на века",
      subtitle: "Сортировка, конструирование и сюжетная игра — сделано на долгие годы",
      ctaLabel: "Деревянные игрушки",
    },
    "visit-yerevan-store": {
      title: "Приходите к нам на проспект Маштоца",
      subtitle: "Посмотрите и попробуйте каждую игрушку лично, открыты каждый день",
      ctaLabel: "Проложить маршрут",
    },
  },
};

export function localizePromotions(locale: Locale): Promotion[] {
  if (locale === "en") return basePromotions;
  const translations = promotionTranslations[locale];
  return basePromotions.map((promo) => {
    const tr = translations[promo.slug];
    return tr ? { ...promo, ...tr } : promo;
  });
}
