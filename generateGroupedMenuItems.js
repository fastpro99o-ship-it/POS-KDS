const fs = require('fs');

let id = 1;
const items = [];

const createItem = (name, category, station, emoji, defaultPrice, variants = [], extras = []) => {
    items.push({
        id: id++,
        name,
        price: defaultPrice, // Base price or primary size price
        category,
        station,
        emoji,
        available: true,
        description: '',
        variants, // [{ name: 'S', price: 15 }, { name: 'P', price: 20 }]
        extras    // [{ name: '+ Omelette', price: 5 }, { name: '+ Gratine', price: 5 }]
    });
};

// 1. LE PETIT DEJEUNER (No variants)
const petitDejeuner = [
    ['THE شاي', 8], ['CAFE قهوة', 6], ['JUS AU CHOIX عصير', 10], ['LAIT AU CHOCOLAT حليب بالشوكولاتة', 6],
    ['OMELETTE AU KHLI3 أمليط بالخليع', 15], ['OMELETTE AU FROMAGE أمليط بالفرماج', 10], ['OMELETTE AUX CREVETTES أمليط بالكروفيت', 15],
    ['OMELETTE NATURE أمليط عادي', 6], ['OMELETTE AUX CHAMPIGNONS أمليط شومبينيو', 8], ['CREPE AUX FRUITS ET CHOCOLAT 2P كريب بالفواكه و الشوكلاط', 15],
    ['GAUFRES كوفغي أو ووفرز', 15], ['PANNA COTTA باناكوتا', 15], ['CREME CARAMEL كريم كراميل', 10], ['TIRAMISU تيراميسو', 15],
    ['MSEMEN مسمن', 3], ['MAKHMAR مخمار', 3]
];
petitDejeuner.forEach(i => createItem(i[0], 'Petit Dejeuner', 'Kitchen', '☕', i[1], [], []));

// 2. SANDWICH / PANINI (Variants S, P & Extra + Omelette)
const sandwiches = [
    ['OMELETTE FROMAGE', 10, 15], ['POULET', 15, 20], ['SAUCISSES', 15, 20], ['VIANDE HACHEE', 15, 20],
    ['MIXTE', 15, 20], ['SPECIAL', 20, 20], ['KEEBDA', 20, 25], ['NUGGET', 25, 25], ['CORDON BLEU', 25, 25]
];
const swExtras = [{ name: 'إضافة أومليت', price: 5 }];
sandwiches.forEach(i => {
    createItem(i[0], 'Sandwich / Panini', 'Kitchen', '🥪', i[1], [{ name: 'Sandwich (S)', price: i[1] }, { name: 'Panini (P)', price: i[2] }], swExtras);
});

// 3. PIZZA (Variants N, G)
const pizzas = [
    ['MARGHERITA', 20, 30], ['VEGETARIENNE', 30, 40], ['CHARCUTERIE', 30, 40], ['POULET', 30, 40],
    ['THON', 30, 40], ['VIANDE HACHEE', 30, 40], ['4 FROMAGE', 40, 50], ['4 SAISON', 40, 50],
    ['FRUITS DE MER', 40, 50], ['ROYAL', 45, 55], ['PARIS FOOD', 45, 55], ['CHOCOLAT', 30, 35]
];
pizzas.forEach(i => {
    createItem(i[0], 'Pizza', 'Oven', '🍕', i[1], [{ name: 'Normal (N)', price: i[1] }, { name: 'Grand (G)', price: i[2] }], []);
});

// 4. PLATS & PATS
const plats = [
    ['POULET', 40], ['SAUCISSES', 40], ['VIANDE HACHEE', 40], ['PLATS NUGGET', 40], ['EMINCE POULET', 40],
    ['CORDON BLEU', 40], ['PLATS ESCALOPE', 50], ['BECARBONARA', 30], ['POULET (Pâtes)', 30], ['BOLONAISE', 30], ['FRUIT DE MER (Pâtes)', 40]
];
plats.forEach(i => createItem(i[0], 'Plats & Pates', 'Kitchen', '🍝', i[1], [], []));

// 5. BOISSONS & SALADES
const boissonsSalades = [
    ['JUS D\'ORANGE', 15], ['JUS DE BANAN', 15], ['JUS D\'AVOCAT', 20], ['JUS MOKHITO', 20], ['JUS PANACHE', 20],
    ['JUS ZA3ZA3', 30], ['CANETTES', 6], ['SALADE PECHEUR', 40], ['SALADE MEXICAINE', 20], ['SALADEMAROCAINE', 20], ['SALADE VARIEE', 25]
];
boissonsSalades.forEach(i => createItem(i[0], 'Boissons & Salades', 'Bar', i[0].includes('SALADE') ? '🥗' : '🥤', i[1], [], []));

// 6. DESSERTS & SUPPLEMENT
const desserts = [
    ['CREPE', 25], ['PANNA COTTA', 25], ['CREME CARAMEL', 35], ['TIRAMISU', 40], ['SALADE DE FRUITS', 40],
    ['NUGGET 5 PIECES', 20], ['FRITE', 5], ['FROMAGE', 5]
];
desserts.forEach(i => createItem(i[0], 'Desserts & Supp', 'Kitchen', i[0].includes('FRITE') ? '🍟' : '🍮', i[1], [], []));

// 7. TACOS (Variants L, XL)
const tacos = [
    ['POULET', 25, 35], ['SAUCISSES', 25, 35], ['VIANDE HACHEE', 25, 35], ['MIXTE', 30, 40],
    ['NUGGET', 30, 40], ['CRESPI', 30, 40]
];
tacos.forEach(i => {
    createItem(i[0], 'Tacos', 'Kitchen', '🌮', i[1], [{ name: 'L', price: i[1] }, { name: 'XL', price: i[2] }], []);
});
// These have only size L:
createItem('CORDON BLEU', 'Tacos', 'Kitchen', '🌮', 30, [{ name: 'L', price: 30 }], []);
createItem('ROYAL', 'Tacos', 'Kitchen', '🌮', 40, [{ name: 'L', price: 40 }], []);

// 8. PASTICOS (Variants & Extras)
createItem('PASTICOS', 'Pasticos', 'Oven', '🥘', 40, [], [
    { name: 'غراتان (Gratine)', price: 5 },
    { name: 'غراتان بيتزا (Gratine Pizza)', price: 10 }
]);


const formatArray = (arr) => "[\n    " + arr.map(i => JSON.stringify(i)).join(",\n    ") + "\n]";

const menuGridPath = 'c:/Users/EL-OTHEMANY/Downloads/KDS-KITCHEN-DISPLAY/components/MenuGrid.js';
const menuManagerPath = 'c:/Users/EL-OTHEMANY/Downloads/KDS-KITCHEN-DISPLAY/components/MenuManager.js';

let menuGridContent = fs.readFileSync(menuGridPath, 'utf8');
menuGridContent = menuGridContent.replace(/const MENU_ITEMS = \[[\s\S]*?\];/, "const MENU_ITEMS = " + formatArray(items) + ";");
fs.writeFileSync(menuGridPath, menuGridContent, 'utf8');

let menuManagerContent = fs.readFileSync(menuManagerPath, 'utf8');
menuManagerContent = menuManagerContent.replace(/const DEFAULT_MENU = \[[\s\S]*?\];/, "const DEFAULT_MENU = " + formatArray(items) + ";");
fs.writeFileSync(menuManagerPath, menuManagerContent, 'utf8');

console.log('Successfully updated MENU_ITEMS with ' + items.length + ' grouped items. Modal properties created!');
