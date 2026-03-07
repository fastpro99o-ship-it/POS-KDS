const fs = require('fs');

const rawData = `
1. LE PETIT DEJEUNER
THE 8
CAFE 6
JUS AU CHOIX 10
LAIT AU CHOCOLAT 6
OMELETTE AU KHLI3 15
OMELETTE AU FROMAGE 10
OMELETTE AUX CREVETTES 15
OMELETTE NATURE 6
OMELETTE AUX CHAMPIGNONS 8
CREPE AUX FRUITS ET CHOCOLAT 2P 15
GAUFRES 15
PANNA COTTA 15
CREME CARAMEL 10
TIRAMISU 15
MSEMEN 3
MAKHMAR 3

2. SANDWICH / PANINI
OMELETTE FROMAGE S10 P15
POULET S15 P20
SAUCISSES S15 P20
VIANDE HACHEE S15 P20
MIXTE S15 P20
SPECIAL S20 P20
KEEBDA S20 P25
NUGGET S25 P25
CORDON BLEU S25 P25
PLUS OMELETTE S5 P0

3. PIZZA
MARGHERITA N20 G30
VEGETARIENNE N30 G40
CHARCUTERIE N30 G40
POULET N30 G40
THON N30 G40
VIANDE HACHEE N30 G40
4 FROMAGE N40 G50
4 SAISON N40 G50
FRUITS DE MER N40 G50
ROYAL N45 G55
PARIS FOOD N45 G55
CHOCOLAT N30 G35

4. PLATS & PATS
POULET 40
SAUCISSES 40
VIANDE HACHEE 40
PLATS NUGGET 40
EMINCE POULET 40
CORDON BLEU 40
PLATS ESCALOPE 50
BECARBONARA 30
POULET PATES 30
BOLONAISE 30
FRUIT DE MER PATES 40

5. BOISSONS & SALADES
JUS D'ORANGE 15
JUS DE BANAN 15
JUS D'AVOCAT 20
JUS MOKHITO 20
JUS PANACHE 20
JUS ZA3ZA3 30
CANETTES 6
SALADE PECHEUR 40
SALADE MEXICAINE 20
SALADEMAROCAINE 20
SALADE VARIEE 25

6. DESSERTS & SUPPLEMENT
CREPE 25
PANNA COTTA 25
CREME CARAMEL 35
TIRAMISU 40
SALADE DE FRUITS 40
NUGGET 5 PIECES 20
FRITE 5
FROMAGE 5

7. TACOS
POULET L25 XL35
SAUCISSES L25 XL35
VIANDE HACHEE L25 XL35
MIXTE L30 XL40
NUGGET L30 XL40
CRESPI L30 XL40
CORDON BLEU L30
ROYAL L40

8. PASTICOS
PASTICOS 40
PASTICOS GRATINE 45
PASTICOS GRATINE PIZZA 50
`;

let id = 1;
const items = [];
const emojis = {
    '1': '☕', // Petit Dejeuner
    '2': '🥪', // Sandwich / Panini
    '3': '🍕', // Pizza
    '4': '🍝', // Plats & Pats
    '5': '🥤', // Boissons & Salades
    '6': '🍮', // Desserts & Supplement
    '7': '🌮', // Tacos
    '8': '🥘'  // Pasticos
};

const stations = {
    '1': 'Cafeteria',
    '2': 'Kitchen',
    '3': 'Oven',
    '4': 'Kitchen',
    '5': 'Bar',
    '6': 'Cafeteria',
    '7': 'Grill',
    '8': 'Oven'
};

const cats = {
    '1': 'Petit Dejeuner',
    '2': 'Sandwiches/Paninis',
    '3': 'Pizza',
    '4': 'Plats & Pates',
    '5': 'Boissons/Salades',
    '6': 'Desserts/Supps',
    '7': 'Tacos',
    '8': 'Pasticos'
};

const lines = rawData.split('\\n').map(l => l.trim()).filter(Boolean);
let currentSect = '1';

lines.forEach(line => {
    if (line.match(/^\d\./)) {
        currentSect = line[0];
        return;
    }

    const category = cats[currentSect];
    const emoji = emojis[currentSect] || '🍔';
    const station = stations[currentSect] || 'Kitchen';

    if (currentSect === '2' || currentSect === '3' || currentSect === '7') {
        const parts = line.split(' ');
        const nameParts = [];
        let p1 = 0, p2 = 0;
        let suffix1 = '', suffix2 = '';

        parts.forEach(p => {
            if (p.startsWith('S') && !isNaN(parseInt(p.substring(1)))) {
                p1 = parseInt(p.substring(1));
                suffix1 = 'Sandwich';
            } else if (p.startsWith('P') && !isNaN(parseInt(p.substring(1)))) {
                p2 = parseInt(p.substring(1));
                suffix2 = 'Panini';
            } else if (p.startsWith('N') && !isNaN(parseInt(p.substring(1)))) {
                p1 = parseInt(p.substring(1));
                suffix1 = 'N (Normal)';
            } else if (p.startsWith('G') && !isNaN(parseInt(p.substring(1)))) {
                p2 = parseInt(p.substring(1));
                suffix2 = 'G (Grand)';
            } else if (p.startsWith('L') && !isNaN(parseInt(p.substring(1)))) {
                p1 = parseInt(p.substring(1));
                suffix1 = 'L';
            } else if (p.startsWith('XL') && !isNaN(parseInt(p.substring(2)))) {
                p2 = parseInt(p.substring(2));
                suffix2 = 'XL';
            } else {
                nameParts.push(p);
            }
        });

        const baseName = nameParts.join(' ');
        if (p1 > 0) {
            items.push({ id: id++, name: baseName + ' ' + suffix1, price: p1, category, station, emoji, available: true, description: '' });
        }
        if (p2 > 0) {
            items.push({ id: id++, name: baseName + ' ' + suffix2, price: p2, category, station, emoji, available: true, description: '' });
        }
    } else {
        const parts = line.split(' ');
        const price = parseInt(parts.pop());
        const name = parts.join(' ');
        if (!isNaN(price)) {
            items.push({ id: id++, name, price, category, station, emoji, available: true, description: '' });
        }
    }
});

const getFileStr = (path) => fs.readFileSync(path, 'utf8');
const writeFileStr = (path, content) => fs.writeFileSync(path, content, 'utf8');

const formatArray = (arr) => \`[\n    \` + arr.map(i => JSON.stringify(i)).join(',\n    ') + \`\n]\`;

const menuGridPath = 'c:/Users/EL-OTHEMANY/Downloads/KDS-KITCHEN-DISPLAY/components/MenuGrid.js';
const menuManagerPath = 'c:/Users/EL-OTHEMANY/Downloads/KDS-KITCHEN-DISPLAY/components/MenuManager.js';

let menuGridContent = getFileStr(menuGridPath);
menuGridContent = menuGridContent.replace(/const MENU_ITEMS = \[[\s\S]*?\];/, \`const MENU_ITEMS = \${formatArray(items)};\`);
menuGridContent = menuGridContent.replace(/const CATEGORIES = \[.*?\];/, \`const CATEGORIES = ['All', 'Petit Dejeuner', 'Sandwiches/Paninis', 'Pizza', 'Plats & Pates', 'Boissons/Salades', 'Desserts/Supps', 'Tacos', 'Pasticos'];\`);
writeFileStr(menuGridPath, menuGridContent);

let menuManagerContent = getFileStr(menuManagerPath);
menuManagerContent = menuManagerContent.replace(/const DEFAULT_MENU = \[[\s\S]*?\];/, \`const DEFAULT_MENU = \${formatArray(items)};\`);
menuManagerContent = menuManagerContent.replace(/const CATEGORIES = \[.*?\];/, \`const CATEGORIES = ['Petit Dejeuner', 'Sandwiches/Paninis', 'Pizza', 'Plats & Pates', 'Boissons/Salades', 'Desserts/Supps', 'Tacos', 'Pasticos'];\`);
menuManagerContent = menuManagerContent.replace(/const STATIONS = \[.*?\];/, \`const STATIONS = ['Kitchen', 'Cafeteria', 'Bar', 'Grill', 'Fryer', 'Oven', 'Salads'];\`);
writeFileStr(menuManagerPath, menuManagerContent);

console.log("Replaced menus successfully! Number of items:", items.length);
