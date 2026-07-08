import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SAFETY_STANDARD = [
  "Tested to ASTM F963 & EN71 safety standards",
  "Non-toxic, water-based paints and finishes",
  "No small parts hazard for stated age range",
];

interface SeedProduct {
  slug: string;
  name: string; nameHy: string; nameRu: string;
  shortDescription: string; shortDescriptionHy: string; shortDescriptionRu: string;
  description: string; descriptionHy: string; descriptionRu: string;
  priceAmd: number;
  compareAtPriceAmd?: number;
  category: string;
  subcategory: string;
  ageRange: string;
  materials: string[];
  safetyInfo: string[];
  brand: string;
  images: { src: string; alt: string }[];
  inStock: boolean;
  sku: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  relatedSlugs?: string[];
  dimensions?: string;
  weightGrams?: number;
  careInstructions?: string;
}

const products: SeedProduct[] = [
  {
    slug: "stacking-rainbow-arches",
    name: "Stacking Rainbow Arches",
    nameHy: "Ծիածան աշտարակող կամարներ",
    nameRu: "Радужные штабелируемые арки",
    shortDescription: "Sustainably sourced beechwood stacking arches in soft rainbow tones.",
    shortDescriptionHy: "Կայուն ձևով ձեռք բերված հաճարենու փայտից աշտարակող կամարներ՝ փափուկ ծիածանագույն երանգներով։",
    shortDescriptionRu: "Экологичные штабелируемые арки из бука в мягких радужных тонах.",
    description:
      "Our best-selling stacking toy, hand-finished from sustainably harvested beechwood and colored with plant-based dyes. Little ones stack, nest, and balance the seven arches into rainbows, tunnels, and towers, building hand-eye coordination and early color and size recognition along the way. Smooth, rounded edges are safe for grabby hands and teething mouths.",
    descriptionHy:
      "Մեր ամենավաճառվող աշտարակող խաղալիքը, ձեռքով մշակված կայուն հաճարենու փայտից և ներկված բուսական ներկերով։ Փոքրիկները դասավորում, տեղադրում և հավասարակշռում են յոթ կամարները՝ կազմելով ծիածաններ, թունելներ և աշտարակներ, զարգացնելով ձեռք-աչք համակարգումը և վաղ գույների ու չափերի ընկալումը։ Հարթ, կլորացված եզրերը անվտանգ են ամուր բռնող ձեռքերի և ատամ հանող բերանների համար։",
    descriptionRu:
      "Наш самый продаваемый штабелируемый игровой набор, вручную обработанный из экологично заготовленного бука и окрашенный растительными красителями. Малыши составляют, вкладывают и балансируют семь арок, создавая радуги, туннели и башни, развивая координацию рук и глаз, а также раннее восприятие цвета и размера. Гладкие, закруглённые края безопасны для цепких ручек и для прорезывания зубов.",
    priceAmd: 18500,
    compareAtPriceAmd: 24000,
    category: "wooden-toys",
    subcategory: "stacking-sorting",
    ageRange: "0-3",
    materials: ["Sustainably sourced beechwood", "Plant-based, non-toxic dye"],
    safetyInfo: SAFETY_STANDARD,
    brand: "Woodland Play",
    images: [
      { src: "/images/products/stacking-rainbow-arches-1.svg", alt: "Wooden rainbow stacking arches in pastel colors nested together" },
      { src: "/images/products/stacking-rainbow-arches-2.svg", alt: "Rainbow stacking arches arranged as a tunnel for pretend play" },
    ],
    inStock: true,
    sku: "ML-WT-001",
    featured: true,
    bestseller: true,
    relatedSlugs: ["chunky-shape-sorter", "wooden-nesting-cups"],
    dimensions: "24 x 6 x 12 cm",
    weightGrams: 650,
    careInstructions: "Wipe clean with a soft, slightly damp cloth. Avoid soaking or dishwashers.",
  },
  {
    slug: "chunky-shape-sorter",
    name: "Chunky Shape Sorter Box",
    nameHy: "Խոշոր ձևերի տեսակավորիչ արկղ",
    nameRu: "Крупная сортировка форм",
    shortDescription: "First shape-sorting box with five chunky wooden shapes.",
    shortDescriptionHy: "Առաջին ձևերի տեսակավորման արկղ՝ հինգ խոշոր փայտյա ձևերով։",
    shortDescriptionRu: "Первая коробка-сортер с пятью крупными деревянными фигурами.",
    description:
      "A gentle introduction to problem-solving, this solid wood sorting box pairs five chunky shapes with matching cut-outs. Rounded knobs on each shape make it easy for small fingers to grip, place, and release — encouraging fine motor skills, shape recognition, and cause-and-effect learning.",
    descriptionHy:
      "Խնդիրների լուծման մեղմ ներածություն է այս զանգվածեղեն փայտից տեսակավորման արկղը, որը զուգակցում է հինգ խոշոր ձև իրենց համապատասխան բացվածքների հետ։ Յուրաքանչյուր ձևի կլորացված բռնակները հեշտացնում են փոքրիկ մատների բռնելը, տեղադրելը և բաց թողնելը՝ խթանելով նուրբ շարժողական հմտությունները, ձևերի ճանաչումը և պատճառահետևանքային ուսուցումը։",
    descriptionRu:
      "Мягкое знакомство с решением задач — эта коробка-сортер из массива дерева сочетает пять крупных фигур с соответствующими прорезями. Закруглённые ручки на каждой фигуре облегчают захват, размещение и отпускание маленькими пальчиками, развивая мелкую моторику, распознавание форм и понимание причинно-следственных связей.",
    priceAmd: 15900,
    category: "educational",
    subcategory: "early-learning",
    ageRange: "0-3",
    materials: ["Solid rubberwood", "Non-toxic lacquer finish"],
    safetyInfo: SAFETY_STANDARD,
    brand: "Little Sprout Toys",
    images: [
      { src: "/images/products/chunky-shape-sorter-1.svg", alt: "Wooden shape sorter box with chunky colorful shapes" },
      { src: "/images/products/chunky-shape-sorter-2.svg", alt: "Toddler placing a shape into the sorter box" },
    ],
    inStock: true,
    sku: "ML-ED-002",
    featured: true,
    relatedSlugs: ["stacking-rainbow-arches", "wooden-nesting-cups"],
    dimensions: "16 x 16 x 10 cm",
    weightGrams: 480,
  },
  {
    slug: "wooden-nesting-cups",
    name: "Rainbow Nesting Cups",
    nameHy: "Ծիածան բույն-բաժակներ",
    nameRu: "Радужные вкладывающиеся стаканчики",
    shortDescription: "Ten stackable, nestable cups for counting, stacking, and bath play.",
    shortDescriptionHy: "Տասը դասավորվող, մեկը մյուսի մեջ մտնող բաժակներ՝ հաշվելու, դասավորելու և լոգանքի խաղի համար։",
    shortDescriptionRu: "Десять составных стаканчиков для счёта, составления башен и игр в ванной.",
    description:
      "Ten lightweight wooden cups in graduated sizes, numbered 1–10 on the base for early counting practice. Stack them into towers, nest them together, or use them as sandbox scoops — a simple toy with dozens of ways to play.",
    descriptionHy:
      "Տասը թեթև փայտյա բաժակներ՝ աստիճանաբար մեծացող չափերով, հիմքին համարակալված 1–10՝ վաղ հաշվելու վարժանքի համար։ Դասավորեք դրանք աշտարակների մեջ, տեղադրեք մեկը մյուսի մեջ, կամ օգտագործեք որպես ավազարկղի շերեփներ․ պարզ խաղալիք՝ խաղալու տասնյակ եղանակներով։",
    descriptionRu:
      "Десять лёгких деревянных стаканчиков возрастающего размера, пронумерованных 1–10 на дне для первых упражнений в счёте. Складывайте их в башни, вкладывайте друг в друга или используйте как совочки в песочнице — простая игрушка с десятками способов игры.",
    priceAmd: 12500,
    category: "wooden-toys",
    subcategory: "stacking-sorting",
    ageRange: "0-3",
    materials: ["FSC-certified pine", "Water-based paint"],
    safetyInfo: SAFETY_STANDARD,
    brand: "Woodland Play",
    images: [{ src: "/images/products/wooden-nesting-cups-1.svg", alt: "Set of ten rainbow-colored wooden nesting cups" }],
    inStock: true,
    sku: "ML-WT-003",
    relatedSlugs: ["stacking-rainbow-arches", "chunky-shape-sorter"],
    dimensions: "18 x 18 x 16 cm (stacked)",
    weightGrams: 520,
  },
  {
    slug: "first-building-blocks-set",
    name: "First Building Blocks — 40 Piece Set",
    nameHy: "Առաջին կառուցողական խորանարդիկներ — 40 կտոր",
    nameRu: "Первые строительные блоки — набор из 40 деталей",
    shortDescription: "Classic solid-wood building blocks in a canvas storage bag.",
    shortDescriptionHy: "Դասական զանգվածեղեն փայտից կառուցողական խորանարդիկներ՝ կտավե պահեստային պայուսակով։",
    shortDescriptionRu: "Классические деревянные строительные блоки в холщовом мешке для хранения.",
    description:
      "Forty smooth, solid-wood blocks in a variety of shapes — cubes, arches, cylinders, and triangles — finished in warm natural tones and soft pastels. A timeless open-ended toy that grows with your child, from early stacking to elaborate towers and cities. Comes with a reusable canvas storage bag.",
    descriptionHy:
      "Քառասուն հարթ, զանգվածեղեն փայտից բլոկներ՝ տարբեր ձևերով (խորանարդներ, կամարներ, գլաններ և եռանկյուններ), ներկված տաք բնական երանգներով և փափուկ պաստելային գույներով։ Ժամանակազերծ, բաց խաղալիք, որը մեծանում է Ձեր երեխայի հետ միասին՝ սկզբնական դասավորումից մինչև բարդ աշտարակներ և քաղաքներ։ Գալիս է կրկնակի օգտագործման կտավե պայուսակով։",
    descriptionRu:
      "Сорок гладких блоков из массива дерева разных форм — кубики, арки, цилиндры и треугольники — окрашенные в тёплые натуральные и мягкие пастельные тона. Вечная игрушка с открытым концом, которая растёт вместе с ребёнком — от первых башен до сложных городов. В комплекте многоразовый холщовый мешок для хранения.",
    priceAmd: 21000,
    compareAtPriceAmd: 26000,
    category: "wooden-toys",
    subcategory: "stacking-sorting",
    ageRange: "3-6",
    materials: ["Solid birchwood", "Non-toxic finish"],
    safetyInfo: SAFETY_STANDARD,
    brand: "Max & Lizzy Collection",
    images: [
      { src: "/images/products/first-building-blocks-set-1.svg", alt: "40-piece natural wood building block set" },
      { src: "/images/products/first-building-blocks-set-2.svg", alt: "Child's tower built from wooden building blocks" },
    ],
    inStock: true,
    sku: "ML-WT-004",
    featured: true,
    bestseller: true,
    relatedSlugs: ["wooden-marble-run", "magnetic-building-tiles"],
    dimensions: "30 x 20 x 10 cm (boxed)",
    weightGrams: 1800,
  },
  {
    slug: "magnetic-building-tiles",
    name: "Magnetic Building Tiles — 60 Piece",
    nameHy: "Մագնիսական կառուցողական սալիկներ — 60 կտոր",
    nameRu: "Магнитные конструкторные плитки — 60 деталей",
    shortDescription: "Translucent magnetic tiles for open-ended STEM building.",
    shortDescriptionHy: "Կիսաթափանցիկ մագնիսական սալիկներ՝ բաց ՍՏԵՄ կառուցման համար։",
    shortDescriptionRu: "Полупрозрачные магнитные плитки для свободного STEM-конструирования.",
    description:
      "Sixty colorful magnetic tiles that snap together to build towers, houses, cars, and more. Strong, encased magnets and BPA-free plastic make this a durable STEM favorite that builds spatial reasoning, creativity, and early geometry concepts. Compatible with most other major magnetic tile brands.",
    descriptionHy:
      "Վաթսուն գունավոր մագնիսական սալիկներ, որոնք միանում են՝ կառուցելու աշտարակներ, տներ, մեքենաներ և ավելին։ Ամուր, պատված մագնիսները և BPA-ից զերծ պլաստիկը այս ՍՏԵՄ սիրելիին դարձնում են դիմացկուն՝ զարգացնելով տարածական մտածողությունը, ստեղծագործականությունը և վաղ երկրաչափական հասկացությունները։ Համատեղելի է մագնիսական սալիկների այլ խոշոր ապրանքանիշների հետ։",
    descriptionRu:
      "Шестьдесят цветных магнитных плиток, которые соединяются для строительства башен, домов, машин и многого другого. Прочные, защищённые магниты и пластик без BPA делают этот STEM-фаворит долговечным, развивая пространственное мышление, творчество и ранние геометрические понятия. Совместимо с большинством других крупных брендов магнитных плиток.",
    priceAmd: 27500,
    category: "educational",
    subcategory: "stem",
    ageRange: "3-6",
    materials: ["BPA-free ABS plastic", "Encased ceramic magnets"],
    safetyInfo: SAFETY_STANDARD,
    brand: "Little Sprout Toys",
    images: [
      { src: "/images/products/magnetic-building-tiles-1.svg", alt: "Colorful translucent magnetic building tiles" },
      { src: "/images/products/magnetic-building-tiles-2.svg", alt: "Tower built from magnetic tiles" },
    ],
    inStock: true,
    sku: "ML-ED-005",
    featured: true,
    relatedSlugs: ["first-building-blocks-set", "wooden-marble-run"],
    dimensions: "28 x 20 x 8 cm (boxed)",
    weightGrams: 900,
  },
  {
    slug: "wooden-marble-run",
    name: "Wooden Marble Run — Starter Set",
    nameHy: "Փայտյա գնդիկների ուղի — մեկնարկային հավաքածու",
    nameRu: "Деревянная горка для шариков — стартовый набор",
    shortDescription: "Modular wooden marble run panels with 10 glass marbles.",
    shortDescriptionHy: "Մոդուլային փայտյա գնդիկների ուղու վահանակներ՝ 10 ապակե գնդիկներով։",
    shortDescriptionRu: "Модульные деревянные панели для горки с 10 стеклянными шариками.",
    description:
      "A modular wooden marble run that lets kids design their own tracks, ramps, and drops. Includes ten glass marbles and a sturdy frame. Encourages spatial reasoning, early engineering concepts, and cause-and-effect thinking as children test and rebuild their designs.",
    descriptionHy:
      "Մոդուլային փայտյա գնդիկների ուղի, որը երեխաներին թույլ է տալիս նախագծել իրենց սեփական ուղիները, թեքահարթակները և վայրէջքները։ Ներառում է տասը ապակե գնդիկ և ամուր շրջանակ։ Խթանում է տարածական մտածողությունը, վաղ ինժեներական հասկացությունները և պատճառահետևանքային մտածողությունը, երբ երեխաները փորձարկում և վերակառուցում են իրենց նախագծերը։",
    descriptionRu:
      "Модульная деревянная горка для шариков, позволяющая детям самостоятельно проектировать трассы, скаты и спуски. В комплекте десять стеклянных шариков и прочная рама. Развивает пространственное мышление, ранние инженерные понятия и причинно-следственное мышление, пока дети тестируют и перестраивают свои конструкции.",
    priceAmd: 32900,
    category: "educational",
    subcategory: "stem",
    ageRange: "3-6",
    materials: ["Sustainably sourced beechwood", "Glass marbles"],
    safetyInfo: [...SAFETY_STANDARD, "Contains small parts — recommended for ages 3+ with supervision"],
    brand: "Woodland Play",
    images: [{ src: "/images/products/wooden-marble-run-1.svg", alt: "Wooden marble run set with ramps and marbles" }],
    inStock: true,
    sku: "ML-ED-006",
    featured: true,
    newArrival: true,
    relatedSlugs: ["magnetic-building-tiles", "first-building-blocks-set"],
    dimensions: "40 x 30 x 25 cm (assembled)",
    weightGrams: 1400,
  },
  {
    slug: "first-wooden-puzzle-farm",
    name: "First Wooden Puzzle — Farm Animals",
    nameHy: "Առաջին փայտյա գլուխկոտրուկ — ագարակի կենդանիներ",
    nameRu: "Первый деревянный пазл — животные фермы",
    shortDescription: "Chunky-knob wooden puzzle featuring six farm animals.",
    shortDescriptionHy: "Խոշոր բռնակներով փայտյա գլուխկոտրուկ՝ վեց ագարակային կենդանիներով։",
    shortDescriptionRu: "Деревянный пазл с крупными ручками — шесть животных фермы.",
    description:
      "A gentle first puzzle with six farm-animal pieces, each fitted with an easy-grip wooden knob. Bright, friendly illustrations and a sturdy tray base help toddlers build fine motor skills, shape recognition, and animal vocabulary.",
    descriptionHy:
      "Մեղմ առաջին գլուխկոտրուկ՝ վեց ագարակային կենդանիների կտորներով, յուրաքանչյուրը հագեցած հեշտ բռնվող փայտյա բռնակով։ Վառ, բարեհամբույր նկարազարդումները և ամուր հիմքի սկուտեղը օգնում են փոքրիկներին զարգացնել նուրբ շարժողական հմտություններ, ձևերի ճանաչում և կենդանիների բառապաշար։",
    descriptionRu:
      "Мягкий первый пазл с шестью деталями животных фермы, каждая с удобной деревянной ручкой для захвата. Яркие, дружелюбные иллюстрации и прочная основа-поднос помогают малышам развивать мелкую моторику, распознавание форм и словарный запас, связанный с животными.",
    priceAmd: 9800,
    compareAtPriceAmd: 12500,
    category: "puzzles-games",
    subcategory: "wooden-puzzles",
    ageRange: "0-3",
    materials: ["Solid plywood", "Water-based inks"],
    safetyInfo: SAFETY_STANDARD,
    brand: "Little Sprout Toys",
    images: [{ src: "/images/products/first-wooden-puzzle-farm-1.svg", alt: "Wooden knob puzzle with farm animal pieces" }],
    inStock: true,
    sku: "ML-PG-007",
    featured: true,
    bestseller: true,
    relatedSlugs: ["memory-matching-animals", "first-wooden-puzzle-vehicles"],
    dimensions: "22 x 22 x 1.5 cm",
    weightGrams: 350,
  },
  {
    slug: "first-wooden-puzzle-vehicles",
    name: "First Wooden Puzzle — Vehicles",
    nameHy: "Առաջին փայտյա գլուխկոտրուկ — տրանսպորտային միջոցներ",
    nameRu: "Первый деревянный пазл — транспорт",
    shortDescription: "Chunky-knob wooden puzzle featuring six favorite vehicles.",
    shortDescriptionHy: "Խոշոր բռնակներով փայտյա գլուխկոտրուկ՝ վեց սիրելի մեքենաներով։",
    shortDescriptionRu: "Деревянный пазл с крупными ручками — шесть любимых видов транспорта.",
    description:
      "Fire trucks, tractors, planes, and more — this knob puzzle turns puzzle time into a vocabulary-building adventure. Thick, durable wood pieces are sized for small hands and stand up to years of play.",
    descriptionHy:
      "Հրշեջ մեքենաներ, տրակտորներ, ինքնաթիռներ և ավելին. այս բռնակավոր գլուխկոտրուկը գլուխկոտրուկի ժամանակը վերածում է բառապաշար հարստացնող արկածի։ Հաստ, դիմացկուն փայտյա կտորները հարմարեցված են փոքրիկ ձեռքերի համար և դիմանում են երկար տարիների խաղին։",
    descriptionRu:
      "Пожарные машины, тракторы, самолёты и многое другое — этот пазл с ручками превращает время пазлов в приключение по расширению словарного запаса. Толстые, прочные деревянные детали подходят маленьким ручкам и выдерживают годы игры.",
    priceAmd: 9800,
    category: "puzzles-games",
    subcategory: "wooden-puzzles",
    ageRange: "0-3",
    materials: ["Solid plywood", "Water-based inks"],
    safetyInfo: SAFETY_STANDARD,
    brand: "Little Sprout Toys",
    images: [{ src: "/images/products/first-wooden-puzzle-vehicles-1.svg", alt: "Wooden knob puzzle with vehicle pieces" }],
    inStock: true,
    sku: "ML-PG-008",
    relatedSlugs: ["first-wooden-puzzle-farm", "memory-matching-animals"],
    dimensions: "22 x 22 x 1.5 cm",
    weightGrams: 350,
  },
  {
    slug: "memory-matching-animals",
    name: "Woodland Memory Matching Game",
    nameHy: "Անտառային հիշողության խաղ",
    nameRu: "Лесная игра на память",
    shortDescription: "24-tile wooden memory game with hand-illustrated forest animals.",
    shortDescriptionHy: "24 սալիկանոց փայտյա հիշողության խաղ՝ ձեռքով նկարազարդված անտառային կենդանիներով։",
    shortDescriptionRu: "Деревянная игра на память из 24 плиток с рисованными лесными животными.",
    description:
      "A cooperative-friendly memory and matching game featuring 24 tiles illustrated with charming forest animals. Builds concentration, visual memory, and turn-taking skills, and comes packaged in a reusable drawstring pouch.",
    descriptionHy:
      "Համագործակցության համար հարմար հիշողության և զուգորդման խաղ՝ 24 սալիկով, նկարազարդված հմայիչ անտառային կենդանիներով։ Զարգացնում է կենտրոնացումը, տեսողական հիշողությունը և հերթականությամբ խաղալու հմտությունները և փաթեթավորված է կրկնակի օգտագործման պարկով։",
    descriptionRu:
      "Игра на память и сопоставление, подходящая для совместной игры, с 24 плитками, украшенными очаровательными лесными животными. Развивает концентрацию, зрительную память и навык очерёдности, упакована в многоразовый мешочек на завязках.",
    priceAmd: 11200,
    category: "puzzles-games",
    subcategory: "matching-memory",
    ageRange: "3-6",
    materials: ["Baltic birch plywood", "Non-toxic inks"],
    safetyInfo: SAFETY_STANDARD,
    brand: "Max & Lizzy Collection",
    images: [{ src: "/images/products/memory-matching-animals-1.svg", alt: "Wooden memory matching tiles with animal illustrations" }],
    inStock: true,
    sku: "ML-PG-009",
    relatedSlugs: ["first-wooden-puzzle-farm", "first-cooperative-board-game"],
    dimensions: "16 x 16 x 4 cm (boxed)",
    weightGrams: 400,
  },
  {
    slug: "first-cooperative-board-game",
    name: "Little Explorers Cooperative Board Game",
    nameHy: "«Փոքրիկ հետազոտողներ» համագործակցային սեղանի խաղ",
    nameRu: "Кооперативная настольная игра «Маленькие исследователи»",
    shortDescription: "A gentle first board game where everybody wins together.",
    shortDescriptionHy: "Մեղմ առաջին սեղանի խաղ, որտեղ բոլորը միասին են հաղթում։",
    shortDescriptionRu: "Мягкая первая настольная игра, где все побеждают вместе.",
    description:
      "Designed for early game-players, this cooperative board game has no losers — the whole family works together to help woodland friends find their way home. Introduces turn-taking, counting, and following simple rules without the pressure of competition.",
    descriptionHy:
      "Նախատեսված վաղ խաղացողների համար, այս համագործակցային սեղանի խաղը հաղթողներ չունի․ ողջ ընտանիքը միասին աշխատում է՝ օգնելու անտառային ընկերներին տուն գտնել։ Ներկայացնում է հերթականությունը, հաշվելը և պարզ կանոններին հետևելը՝ առանց մրցակցության ճնշման։",
    descriptionRu:
      "Разработанная для юных игроков, эта кооперативная настольная игра не имеет проигравших — вся семья работает сообща, чтобы помочь лесным друзьям найти дорогу домой. Знакомит с очерёдностью ходов, счётом и следованием простым правилам без давления соревнования.",
    priceAmd: 14500,
    category: "puzzles-games",
    subcategory: "first-games",
    ageRange: "3-6",
    materials: ["Recycled cardboard", "Solid wood game pieces"],
    safetyInfo: SAFETY_STANDARD,
    brand: "Little Sprout Toys",
    images: [{ src: "/images/products/first-cooperative-board-game-1.svg", alt: "Cooperative board game box and wooden game pieces" }],
    inStock: true,
    sku: "ML-PG-010",
    newArrival: true,
    relatedSlugs: ["memory-matching-animals"],
    dimensions: "26 x 26 x 6 cm (boxed)",
    weightGrams: 750,
  },
  {
    slug: "wooden-balance-bike",
    name: "Wooden Balance Bike",
    nameHy: "Փայտյա հավասարակշռության հեծանիվ",
    nameRu: "Деревянный беговел",
    shortDescription: "Lightweight wooden balance bike for first riding adventures.",
    shortDescriptionHy: "Թեթևակշիռ փայտյա հավասարակշռության հեծանիվ՝ առաջին հեծանվարկածությունների համար։",
    shortDescriptionRu: "Лёгкий деревянный беговел для первых велосипедных приключений.",
    description:
      "A featherlight balance bike crafted from solid birch plywood, designed to help toddlers develop balance and coordination before pedals enter the picture. Adjustable seat height grows with your child, and puncture-proof rubber tires are ready for sidewalks, parks, and everything in between.",
    descriptionHy:
      "Փետրաքաշ հավասարակշռության հեծանիվ՝ պատրաստված զանգվածեղեն կեչու փայտից, նախատեսված օգնելու փոքրիկներին զարգացնել հավասարակշռություն և համակարգում՝ նախքան դեդալները։ Կարգավորվող նստատեղի բարձրությունը մեծանում է երեխայի հետ, իսկ ծակոցադիմացկուն ռետինե անվադողերը պատրաստ են մայթերի, զբոսայգիների և ամեն ինչի համար։",
    descriptionRu:
      "Невесомый беговел из массива берёзовой фанеры, созданный, чтобы помочь малышам развить баланс и координацию ещё до появления педалей. Регулируемая высота сиденья растёт вместе с ребёнком, а неприкалываемые резиновые шины готовы к тротуарам, паркам и всему остальному.",
    priceAmd: 42000,
    compareAtPriceAmd: 49000,
    category: "outdoor-play",
    subcategory: "ride-on",
    ageRange: "3-6",
    materials: ["Birch plywood", "Puncture-proof rubber tires"],
    safetyInfo: SAFETY_STANDARD,
    brand: "Woodland Play",
    images: [
      { src: "/images/products/wooden-balance-bike-1.svg", alt: "Wooden balance bike for toddlers" },
      { src: "/images/products/wooden-balance-bike-2.svg", alt: "Child riding a wooden balance bike outdoors" },
    ],
    inStock: true,
    sku: "ML-OP-011",
    featured: true,
    bestseller: true,
    relatedSlugs: ["sand-and-water-table", "outdoor-activity-cube"],
    dimensions: "82 x 20 x 46 cm",
    weightGrams: 3200,
  },
  {
    slug: "sand-and-water-table",
    name: "Sand & Water Play Table",
    nameHy: "Ավազի և ջրի խաղասեղան",
    nameRu: "Стол для игр с песком и водой",
    shortDescription: "Two-basin wooden play table for sand and water sensory fun.",
    shortDescriptionHy: "Երկու ավազանով փայտյա խաղասեղան՝ ավազի և ջրի զգայական խաղի համար։",
    shortDescriptionRu: "Деревянный игровой стол с двумя ёмкостями для сенсорных игр с песком и водой.",
    description:
      "A sturdy wooden play table with two removable basins for mixing sand and water play. Includes scoops, a wheel, and pouring cups. Encourages sensory exploration, early physics concepts, and cooperative outdoor play with siblings and friends.",
    descriptionHy:
      "Ամուր փայտյա խաղասեղան երկու հանվող ավազանով՝ ավազի և ջրի խաղը միասին խառնելու համար։ Ներառում է շերեփներ, անիվ և լցնող բաժակներ։ Խթանում է զգայական հետազոտությունը, վաղ ֆիզիկայի հասկացությունները և համագործակցային բացօթյա խաղը քույրերի, եղբայրների ու ընկերների հետ։",
    descriptionRu:
      "Прочный деревянный игровой стол с двумя съёмными ёмкостями для смешивания игр с песком и водой. В комплекте совки, колесо и стаканчики для переливания. Развивает сенсорное исследование, ранние понятия физики и совместную игру на улице с братьями, сёстрами и друзьями.",
    priceAmd: 38500,
    category: "outdoor-play",
    subcategory: "sand-water",
    ageRange: "3-6",
    materials: ["FSC-certified pine frame", "BPA-free plastic basins"],
    safetyInfo: SAFETY_STANDARD,
    brand: "Max & Lizzy Collection",
    images: [{ src: "/images/products/sand-and-water-table-1.svg", alt: "Wooden sand and water play table with accessories" }],
    inStock: true,
    sku: "ML-OP-012",
    relatedSlugs: ["wooden-balance-bike", "outdoor-activity-cube"],
    dimensions: "90 x 50 x 55 cm",
    weightGrams: 9500,
  },
  {
    slug: "outdoor-activity-cube",
    name: "Outdoor Activity Cube",
    nameHy: "Բացօթյա ակտիվության խորանարդ",
    nameRu: "Уличный игровой куб",
    shortDescription: "Weatherproof wooden activity cube with five sensory panels.",
    shortDescriptionHy: "Եղանակադիմացկուն փայտյա ակտիվության խորանարդ՝ հինգ զգայական վահանակներով։",
    shortDescriptionRu: "Всепогодный деревянный игровой куб с пятью сенсорными панелями.",
    description:
      "A weather-resistant wooden activity cube with five interactive panels — gears, a xylophone, a maze, a spinning wheel, and a chalkboard face. Designed for garden and balcony play, it keeps little hands busy while building fine motor and cause-and-effect skills.",
    descriptionHy:
      "Եղանակադիմացկուն փայտյա ակտիվության խորանարդ՝ հինգ ինտերակտիվ վահանակներով՝ ատամնանիվներ, քսիլոֆոն, լաբիրինթոս, պտտվող անիվ և գրատախտակի երես։ Նախատեսված այգու և պատշգամբի խաղի համար, այն զբաղեցնում է փոքրիկ ձեռքերը՝ զարգացնելով նուրբ շարժողական և պատճառահետևանքային հմտություններ։",
    descriptionRu:
      "Устойчивый к погодным условиям деревянный игровой куб с пятью интерактивными панелями — шестерёнками, ксилофоном, лабиринтом, вращающимся колесом и грифельной доской. Создан для игр в саду и на балконе, он занимает маленькие ручки, развивая мелкую моторику и причинно-следственное мышление.",
    priceAmd: 29900,
    category: "outdoor-play",
    subcategory: "active-play",
    ageRange: "3-6",
    materials: ["Weatherproof-treated pine", "Powder-coated metal fittings"],
    safetyInfo: SAFETY_STANDARD,
    brand: "Woodland Play",
    images: [{ src: "/images/products/outdoor-activity-cube-1.svg", alt: "Wooden outdoor activity cube with sensory panels" }],
    inStock: false,
    sku: "ML-OP-013",
    relatedSlugs: ["sand-and-water-table", "wooden-balance-bike"],
    dimensions: "45 x 45 x 90 cm",
    weightGrams: 8200,
  },
  {
    slug: "organic-cotton-rattle-set",
    name: "Organic Cotton & Wood Rattle Set",
    nameHy: "Օրգանական բամբակի և փայտի զնգոցների հավաքածու",
    nameRu: "Набор погремушек из органического хлопка и дерева",
    shortDescription: "Set of three soft rattles combining organic cotton and beechwood.",
    shortDescriptionHy: "Երեք փափուկ զնգոցներից բաղկացած հավաքածու՝ համադրելով օրգանական բամբակ և հաճարենու փայտ։",
    shortDescriptionRu: "Набор из трёх мягких погремушек, сочетающих органический хлопок и бук.",
    description:
      "A trio of gentle rattles pairing GOTS-certified organic cotton with smooth beechwood rings. Soft jingles and varied textures make these ideal first toys for newborns and infants exploring sound, grip, and texture.",
    descriptionHy:
      "Երեք մեղմ զնգոցներից բաղկացած հավաքածու, որը զուգակցում է GOTS հավաստագրված օրգանական բամբակը հարթ հաճարենու փայտե օղակների հետ։ Փափուկ ղողանջները և տարբեր հյուսվածքները դրանք դարձնում են իդեալական առաջին խաղալիք նորածինների և հյուսվածքը, ձայնը ու բռնելը հետազոտող մանուկների համար։",
    descriptionRu:
      "Трио нежных погремушек, сочетающих сертифицированный GOTS органический хлопок с гладкими кольцами из бука. Мягкий звон и разнообразные текстуры делают их идеальными первыми игрушками для новорождённых и младенцев, исследующих звук, хват и текстуру.",
    priceAmd: 13800,
    compareAtPriceAmd: 17000,
    category: "baby-toddler",
    subcategory: "rattles-teethers",
    ageRange: "0-3",
    materials: ["GOTS-certified organic cotton", "Untreated beechwood"],
    safetyInfo: SAFETY_STANDARD,
    brand: "EcoBambini",
    images: [{ src: "/images/products/organic-cotton-rattle-set-1.svg", alt: "Set of three organic cotton and wood baby rattles" }],
    inStock: true,
    sku: "ML-BT-014",
    featured: true,
    relatedSlugs: ["wooden-teether-ring", "soft-plush-elephant"],
    dimensions: "12 x 5 x 5 cm each",
    weightGrams: 90,
  },
  {
    slug: "wooden-teether-ring",
    name: "Beechwood Teether Ring",
    nameHy: "Հաճարենու փայտից ատամնահանման օղակ",
    nameRu: "Прорезыватель из бука",
    shortDescription: "Single-piece untreated beechwood teether ring.",
    shortDescriptionHy: "Մեկ կտորից պատրաստված չմշակված հաճարենու փայտից ատամնահանման օղակ։",
    shortDescriptionRu: "Цельный прорезыватель для зубов из необработанного бука.",
    description:
      "Carved from a single piece of untreated, food-safe beechwood, this teether ring is sized perfectly for tiny hands and gums. Naturally antimicrobial and finished with organic beeswax and coconut oil — nothing but wood and love.",
    descriptionHy:
      "Փորագրված մեկ կտոր չմշակված, սննդի համար անվտանգ հաճարենու փայտից, այս ատամնահանման օղակը կատարյալ չափի է փոքրիկ ձեռքերի և լնդերի համար։ Բնականորեն հակամանրէային է և ավարտված է օրգանական մեղրամոմով և կոկոսի յուղով․ ոչինչ, բացի փայտից և սիրուց։",
    descriptionRu:
      "Вырезанный из цельного куска необработанного, безопасного для пищевого контакта бука, этот прорезыватель идеально подходит по размеру для маленьких ручек и дёсен. Естественно антимикробный и покрыт органическим пчелиным воском и кокосовым маслом — ничего, кроме дерева и заботы.",
    priceAmd: 6500,
    category: "baby-toddler",
    subcategory: "rattles-teethers",
    ageRange: "0-3",
    materials: ["Untreated beechwood", "Organic beeswax & coconut oil finish"],
    safetyInfo: SAFETY_STANDARD,
    brand: "EcoBambini",
    images: [{ src: "/images/products/wooden-teether-ring-1.svg", alt: "Single-piece beechwood teether ring" }],
    inStock: true,
    sku: "ML-BT-015",
    relatedSlugs: ["organic-cotton-rattle-set", "soft-plush-elephant"],
    dimensions: "8 x 8 x 1.5 cm",
    weightGrams: 40,
  },
  {
    slug: "soft-plush-elephant",
    name: "Organic Cotton Plush Elephant",
    nameHy: "Օրգանական բամբակից պլյուշ փիղ",
    nameRu: "Плюшевый слонёнок из органического хлопка",
    shortDescription: "Huggable plush elephant made from organic cotton, machine washable.",
    shortDescriptionHy: "Փաթաթվող պլյուշ փիղ՝ պատրաստված օրգանական բամբակից, մեքենայով լվացվող։",
    shortDescriptionRu: "Мягкий плюшевый слонёнок из органического хлопка, можно стирать в машине.",
    description:
      "A soft, huggable elephant made from GOTS-certified organic cotton and filled with hypoallergenic recycled polyester fiberfill. Embroidered features (no small parts) make this a safe, machine-washable companion from birth.",
    descriptionHy:
      "Փափուկ, փաթաթվող փիղ՝ պատրաստված GOTS հավաստագրված օրգանական բամբակից և լցված հիպոալերգեն վերամշակված պոլիէսթեր մանրաթելով։ Ասեղնագործված մանրամասները (առանց փոքր մասերի) այն դարձնում են անվտանգ, մեքենայով լվացվող ընկեր՝ ի ծնե։",
    descriptionRu:
      "Мягкий, обнимаемый слонёнок из сертифицированного GOTS органического хлопка, наполненный гипоаллергенным переработанным полиэфирным волокном. Вышитые детали (без мелких частей) делают его безопасным, стирающимся в машине компаньоном с самого рождения.",
    priceAmd: 11500,
    category: "baby-toddler",
    subcategory: "soft-toys",
    ageRange: "0-3",
    materials: ["GOTS-certified organic cotton", "Recycled polyester fill"],
    safetyInfo: SAFETY_STANDARD,
    brand: "EcoBambini",
    images: [{ src: "/images/products/soft-plush-elephant-1.svg", alt: "Soft organic cotton plush elephant toy" }],
    inStock: true,
    sku: "ML-BT-016",
    featured: true,
    bestseller: true,
    relatedSlugs: ["organic-cotton-rattle-set", "wooden-teether-ring"],
    dimensions: "28 x 20 x 15 cm",
    weightGrams: 220,
    careInstructions: "Machine washable, gentle cycle. Air dry.",
  },
  {
    slug: "stacking-bath-boats",
    name: "Stacking Bath Boats",
    nameHy: "Դասավորվող լոգանքի նավակներ",
    nameRu: "Стопка лодочек для ванной",
    shortDescription: "Five nesting wooden bath boats, sealed and buoyant.",
    shortDescriptionHy: "Հինգ մեկը մյուսի մեջ մտնող փայտյա լոգանքի նավակներ, կնքված և լողացող։",
    shortDescriptionRu: "Пять вкладывающихся деревянных лодочек для ванны, герметичных и плавучих.",
    description:
      "Five colorful boats that nest, stack, and float, sealed with a waterproof natural oil finish so they're just as happy in the tub as on the shelf. No drain holes means no trapped water or mildew.",
    descriptionHy:
      "Հինգ գունավոր նավակներ, որոնք դասավորվում, տեղադրվում են և լողում, կնքված ջրակայուն բնական յուղի ծածկույթով, այնպես որ նույնքան երջանիկ են լոգարանում, որքան դարակի վրա։ Ջրահեռացման անցքերի բացակայությունը նշանակում է ոչ մի պահված ջուր կամ բորբոս։",
    descriptionRu:
      "Пять цветных лодочек, которые складываются, вкладываются друг в друга и плавают, покрытые водостойким натуральным маслом, поэтому им так же хорошо в ванне, как и на полке. Отсутствие дренажных отверстий означает отсутствие застоявшейся воды и плесени.",
    priceAmd: 14900,
    category: "baby-toddler",
    subcategory: "bath-toys",
    ageRange: "0-3",
    materials: ["Sealed sustainably sourced maple", "Waterproof natural oil finish"],
    safetyInfo: [...SAFETY_STANDARD, "Drain-hole-free design prevents mold and mildew buildup"],
    brand: "Woodland Play",
    images: [{ src: "/images/products/stacking-bath-boats-1.svg", alt: "Five colorful stacking wooden bath boats" }],
    inStock: true,
    sku: "ML-BT-017",
    newArrival: true,
    relatedSlugs: ["wooden-nesting-cups", "organic-cotton-rattle-set"],
    dimensions: "20 x 8 x 8 cm (largest boat)",
    weightGrams: 300,
  },
  {
    slug: "wooden-play-kitchen-set",
    name: "Mini Wooden Play Kitchen Set",
    nameHy: "Մինի փայտյա խոհանոցային հավաքածու",
    nameRu: "Мини-набор для игры в кухню",
    shortDescription: "12-piece wooden play food and utensil set in a canvas crate.",
    shortDescriptionHy: "12 կտորից բաղկացած փայտյա խաղալիք սննդի և սպասքի հավաքածու՝ կտավե արկղով։",
    shortDescriptionRu: "Набор из 12 деревянных игрушечных продуктов и посуды в холщовом ящике.",
    description:
      "A twelve-piece pretend kitchen set with wooden fruits, vegetables, and utensils, packed in a reusable canvas crate. Encourages imaginative play, early nutrition awareness, and social role-play with friends and siblings.",
    descriptionHy:
      "Տասներկու կտորից բաղկացած երևակայական խոհանոցային հավաքածու՝ փայտյա մրգերով, բանջարեղենով և սպասքով, փաթեթավորված կրկնակի օգտագործման կտավե արկղում։ Խթանում է երևակայական խաղը, վաղ սննդագիտական իրազեկվածությունը և սոցիալական դերային խաղը ընկերների ու քույր-եղբայրների հետ։",
    descriptionRu:
      "Набор из двенадцати предметов для сюжетно-ролевой игры в кухню с деревянными фруктами, овощами и посудой, упакованный в многоразовый холщовый ящик. Развивает воображение, ранние представления о питании и социальную ролевую игру с друзьями и братьями/сёстрами.",
    priceAmd: 19500,
    category: "wooden-toys",
    subcategory: "pretend-play",
    ageRange: "3-6",
    materials: ["Solid maple", "Water-based paint"],
    safetyInfo: SAFETY_STANDARD,
    brand: "Max & Lizzy Collection",
    images: [{ src: "/images/products/wooden-play-kitchen-set-1.svg", alt: "Wooden play food and utensil set" }],
    inStock: true,
    sku: "ML-WT-018",
    relatedSlugs: ["first-building-blocks-set", "wooden-xylophone"],
    dimensions: "24 x 18 x 10 cm (crated)",
    weightGrams: 700,
  },
  {
    slug: "wooden-xylophone",
    name: "Rainbow Wooden Xylophone",
    nameHy: "Ծիածան փայտյա քսիլոֆոն",
    nameRu: "Радужный деревянный ксилофон",
    shortDescription: "Eight-tone wooden xylophone with two mallets.",
    shortDescriptionHy: "Ութ տոնով փայտյա քսիլոֆոն՝ երկու մուրճիկներով։",
    shortDescriptionRu: "Восьмитоновый деревянный ксилофон с двумя молоточками.",
    description:
      "An eight-tone xylophone in a rainbow of colors, tuned for pleasant (not piercing) first musical exploration. Solid wood base and beechwood mallets introduce rhythm, cause-and-effect, and early music appreciation.",
    descriptionHy:
      "Ութ տոնով քսիլոֆոն՝ ծիածանի գույներով, կարգավորված հաճելի (ոչ ականջ ծակող) առաջին երաժշտական հետազոտության համար։ Զանգվածեղեն փայտե հիմքը և հաճարենու փայտից մուրճիկները ներկայացնում են ռիթմը, պատճառահետևանքային կապը և վաղ երաժշտական գնահատումը։",
    descriptionRu:
      "Восьмитоновый ксилофон в радужных цветах, настроенный для приятного (не резкого) первого музыкального знакомства. Основа из массива дерева и молоточки из бука знакомят с ритмом, причинно-следственной связью и ранним музыкальным восприятием.",
    priceAmd: 13200,
    category: "wooden-toys",
    subcategory: "musical",
    ageRange: "3-6",
    materials: ["Solid pine base", "Metal tone bars", "Beechwood mallets"],
    safetyInfo: SAFETY_STANDARD,
    brand: "Little Sprout Toys",
    images: [{ src: "/images/products/wooden-xylophone-1.svg", alt: "Rainbow-colored wooden xylophone with mallets" }],
    inStock: true,
    sku: "ML-WT-019",
    relatedSlugs: ["wooden-play-kitchen-set", "first-building-blocks-set"],
    dimensions: "30 x 12 x 4 cm",
    weightGrams: 550,
  },
  {
    slug: "push-along-caterpillar",
    name: "Push-Along Wooden Caterpillar",
    nameHy: "Հրելով քայլացվող փայտյա թրթուր",
    nameRu: "Каталка-гусеница на палочке",
    shortDescription: "Classic wobbling push toy for early walkers.",
    shortDescriptionHy: "Դասական տատանվող հրելով խաղալիք՝ նոր քայլող երեխաների համար։",
    shortDescriptionRu: "Классическая покачивающаяся каталка для начинающих ходить малышей.",
    description:
      "A cheerful wooden caterpillar that wobbles and clacks as it's pushed along, encouraging early walkers to find their balance and confidence. Extra-long handle is sized right for standing toddlers, and rounded wooden segments are gentle on furniture (and toes).",
    descriptionHy:
      "Ուրախ փայտյա թրթուր, որը տատանվում և թխկթխկացնում է հրելիս՝ խրախուսելով նոր քայլող երեխաներին գտնել իրենց հավասարակշռությունը և վստահությունը։ Երկարացված բռնակը հարմար չափի է կանգնած փոքրիկների համար, իսկ կլորացված փայտե հատվածները մեղմ են կահույքի (և մատների) համար։",
    descriptionRu:
      "Весёлая деревянная гусеница, которая покачивается и постукивает при движении, помогая малышам, только начавшим ходить, обрести баланс и уверенность. Удлинённая ручка подходит по размеру стоящим малышам, а закруглённые деревянные сегменты бережны к мебели (и пальчикам).",
    priceAmd: 10900,
    category: "wooden-toys",
    subcategory: "push-pull",
    ageRange: "0-3",
    materials: ["Solid beechwood", "Non-toxic lacquer"],
    safetyInfo: SAFETY_STANDARD,
    brand: "Woodland Play",
    images: [{ src: "/images/products/push-along-caterpillar-1.svg", alt: "Wooden push-along caterpillar toy on wheels" }],
    inStock: true,
    sku: "ML-WT-020",
    featured: true,
    bestseller: true,
    relatedSlugs: ["wooden-balance-bike", "stacking-rainbow-arches"],
    dimensions: "28 x 10 x 22 cm",
    weightGrams: 480,
  },
];

async function main() {
  console.log(`Seeding ${products.length} products...`);
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        sku: p.sku,
        name: p.name,
        nameHy: p.nameHy,
        nameRu: p.nameRu,
        shortDescription: p.shortDescription,
        shortDescriptionHy: p.shortDescriptionHy,
        shortDescriptionRu: p.shortDescriptionRu,
        description: p.description,
        descriptionHy: p.descriptionHy,
        descriptionRu: p.descriptionRu,
        priceAmd: p.priceAmd,
        compareAtPriceAmd: p.compareAtPriceAmd,
        category: p.category,
        subcategory: p.subcategory,
        ageRange: p.ageRange,
        brand: p.brand,
        materials: JSON.stringify(p.materials),
        safetyInfo: JSON.stringify(p.safetyInfo),
        images: JSON.stringify(p.images),
        relatedSlugs: p.relatedSlugs ? JSON.stringify(p.relatedSlugs) : null,
        inStock: p.inStock,
        featured: p.featured ?? false,
        bestseller: p.bestseller ?? false,
        newArrival: p.newArrival ?? false,
        dimensions: p.dimensions,
        weightGrams: p.weightGrams,
        careInstructions: p.careInstructions,
      },
    });
  }

  console.log("Seeding promo codes...");
  await prisma.promoCode.upsert({
    where: { code: "WELCOME5" },
    update: {},
    create: { code: "WELCOME5", percentOff: 5, description: "5% off your first order", active: true },
  });

  const adminCount = await prisma.adminUser.count();
  if (adminCount === 0) {
    const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
    if (email && password) {
      console.log(`Creating first admin account (${email})...`);
      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.adminUser.create({
        data: { email, passwordHash, name: "Admin", role: "manager" },
      });
    } else {
      console.warn(
        "No admin account exists and ADMIN_BOOTSTRAP_EMAIL/ADMIN_BOOTSTRAP_PASSWORD are not set — skipping. Set them in .env and re-run `npm run db:seed`."
      );
    }
  } else {
    console.log(`${adminCount} admin account(s) already exist — skipping bootstrap.`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
