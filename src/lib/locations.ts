
export const CITY_COORDS: Record<string, [number, number]> = {
    'Dallas': [32.7767, -96.7970],
    'Irving': [32.8140, -96.9489],
    'Las Colinas': [32.8962, -96.9419],
    'Valley Ranch': [32.9237, -96.9200],
    'Plano': [33.0198, -96.6989],
    'Frisco': [33.1507, -96.8236],
    'McKinney': [33.1972, -96.6398],
    'Arlington': [32.7357, -97.1081],
    'Fort Worth': [32.7555, -97.3308],
    'Richardson': [32.9483, -96.7299],
    'Carrollton': [32.9746, -96.8903],
    'Grapevine': [32.9343, -97.0781],
    'Euless': [32.8374, -97.0819],
    'Bedford': [32.8440, -97.1431],
    'Lewisville': [33.0462, -96.9942],
    'Flower Mound': [33.0146, -97.0970],
    'Denton': [33.2148, -97.1331],
    'Coppell': [32.9546, -97.0150],
    'The Colony': [33.0890, -96.8847],
    'Mesquite': [32.7668, -96.5992],
    'Garland': [32.9126, -96.6389],
    'Rowlett': [32.9029, -96.5639],
    'Rockwall': [32.9312, -96.4597],
    'Wylie': [33.0151, -96.5389],
    'Sachse': [32.9757, -96.5822],
    'Cedar Hill': [32.5885, -96.9511],
    'DeSoto': [32.5896, -96.8569],
    'Duncanville': [32.6518, -96.9083],
    'Lancaster': [32.5921, -96.7561],
    'Waxahachie': [32.3865, -96.8483],
    'Midlothian': [32.4821, -96.9947],
    'Little Elm': [33.1643, -96.9372],
    'Princeton': [33.1782, -96.4983],
    'Forney': [32.7523, -96.4714],
    'Celina': [33.3243, -96.7881],
    'Anna': [33.3501, -96.5511]
};

export const LOCATIONS = [
    {
        city: 'Dallas',
        areas: [
            'Dallas', 'Irving', 'Las Colinas', 'Valley Ranch', 'Plano', 'Frisco', 'McKinney', 'Allen',
            'Prosper', 'Richardson', 'Carrollton', 'Fort Worth', 'Arlington', 'Grapevine', 'Euless',
            'Bedford', 'Lewisville', 'Flower Mound', 'Denton', 'Coppell', 'The Colony', 'Mesquite',
            'Garland', 'Rowlett', 'Rockwall', 'Wylie', 'Sachse', 'Cedar Hill', 'DeSoto', 'Duncanville',
            'Lancaster', 'Waxahachie', 'Midlothian', 'Little Elm', 'Princeton', 'Forney', 'Celina', 'Anna'
        ]
    },
    { city: 'Austin', areas: ['Round Rock', 'Cedar Park', 'Pflugerville', 'Georgetown', 'San Marcos', 'Bee Cave', 'Lakeway'] },
    { city: 'Houston', areas: ['Sugar Land', 'The Woodlands', 'Katy', 'Pearland', 'Cypress', 'Spring', 'Humble'] }
];

export const ALL_AREAS = LOCATIONS.flatMap(loc =>
    loc.areas.map(area => ({ area, city: loc.city }))
);
