// Static military bases dataset — Week 1
// In Week 3+, seed this into PostGIS and query from there.

export const MILITARY_BASES = [
    {
        id: 1,
        name: "Ramstein Air Base",
        country: "Germany",
        branch: "USAF",
        type: "Air Force",
        lat: 49.4369,
        lon: 7.6003,
        personnel: 54000
    },
    {
        id: 2,
        name: "Camp Humphreys",
        country: "South Korea",
        branch: "USA",
        type: "Army",
        lat: 36.9744,
        lon: 127.0139,
        personnel: 42000
    },
    {
        id: 3,
        name: "Kadena Air Base",
        country: "Japan",
        branch: "USAF",
        type: "Air Force",
        lat: 26.3516,
        lon: 127.768,
        personnel: 18000
    },
    {
        id: 4,
        name: "Diego Garcia",
        country: "BIOT",
        branch: "USN",
        type: "Naval",
        lat: -7.3133,
        lon: 72.4233,
        personnel: 3500
    },
    {
        id: 5,
        name: "Al Udeid Air Base",
        country: "Qatar",
        branch: "USAF",
        type: "Air Force",
        lat: 25.1173,
        lon: 51.315,
        personnel: 10000
    },
    {
        id: 6,
        name: "Naval Station Rota",
        country: "Spain",
        branch: "USN",
        type: "Naval",
        lat: 36.6419,
        lon: -6.3353,
        personnel: 6000
    },
    {
        id: 7,
        name: "Aviano Air Base",
        country: "Italy",
        branch: "USAF",
        type: "Air Force",
        lat: 46.0319,
        lon: 12.5964,
        personnel: 5000
    },
    {
        id: 8,
        name: "Incirlik Air Base",
        country: "Turkey",
        branch: "USAF",
        type: "Air Force",
        lat: 37.0019,
        lon: 35.4258,
        personnel: 5000
    },
    {
        id: 9,
        name: "Camp Lemonnier",
        country: "Djibouti",
        branch: "USN",
        type: "Naval",
        lat: 11.5472,
        lon: 43.1594,
        personnel: 4000
    },
    {
        id: 10,
        name: "Guantanamo Bay",
        country: "Cuba",
        branch: "USN",
        type: "Naval",
        lat: 19.906,
        lon: -75.101,
        personnel: 6000
    },
    {
        id: 11,
        name: "Yokota Air Base",
        country: "Japan",
        branch: "USAF",
        type: "Air Force",
        lat: 35.7486,
        lon: 139.3486,
        personnel: 12000
    },
    {
        id: 12,
        name: "Misawa Air Base",
        country: "Japan",
        branch: "USAF",
        type: "Air Force",
        lat: 40.7033,
        lon: 141.3678,
        personnel: 11000
    },
    {
        id: 13,
        name: "Thule Air Base",
        country: "Greenland",
        branch: "USAF",
        type: "Air Force",
        lat: 76.5311,
        lon: -68.7031,
        personnel: 1000
    },
    {
        id: 14,
        name: "Sigonella Naval Air",
        country: "Italy",
        branch: "USN",
        type: "Naval Air",
        lat: 37.4017,
        lon: 14.9222,
        personnel: 5000
    },
    {
        id: 15,
        name: "Hmeimim Air Base",
        country: "Syria",
        branch: "RUAF",
        type: "Air Force",
        lat: 35.4017,
        lon: 35.9486,
        personnel: 5000
    },
    {
        id: 16,
        name: "Tartus Naval Base",
        country: "Syria",
        branch: "RUN",
        type: "Naval",
        lat: 34.895,
        lon: 35.8678,
        personnel: 1700
    },
    {
        id: 17,
        name: "Kant Air Base",
        country: "Kyrgyzstan",
        branch: "RUAF",
        type: "Air Force",
        lat: 42.8436,
        lon: 74.8439,
        personnel: 700
    },
    {
        id: 18,
        name: "Severomorsk Naval",
        country: "Russia",
        branch: "RUN",
        type: "Naval",
        lat: 69.0667,
        lon: 33.4167,
        personnel: 30000
    },
    {
        id: 19,
        name: "Djibouti Support Base",
        country: "Djibouti",
        branch: "PLA",
        type: "Naval",
        lat: 11.5311,
        lon: 43.1419,
        personnel: 2000
    },
    {
        id: 20,
        name: "Fiery Cross Reef",
        country: "South China Sea",
        branch: "PLA",
        type: "Island Base",
        lat: 9.5483,
        lon: 114.2297,
        personnel: 200
    },
    {
        id: 21,
        name: "Subi Reef",
        country: "South China Sea",
        branch: "PLA",
        type: "Island Base",
        lat: 10.9256,
        lon: 114.0833,
        personnel: 200
    },
    {
        id: 22,
        name: "Mischief Reef",
        country: "South China Sea",
        branch: "PLA",
        type: "Island Base",
        lat: 9.9044,
        lon: 115.535,
        personnel: 200
    },
    {
        id: 23,
        name: "RAF Lakenheath",
        country: "United Kingdom",
        branch: "USAF",
        type: "Air Force",
        lat: 52.4094,
        lon: 0.5600,
        personnel: 9000
    },
    {
        id: 24,
        name: "RAF Menwith Hill",
        country: "United Kingdom",
        branch: "NSA",
        type: "SIGINT",
        lat: 53.9914,
        lon: -1.6869,
        personnel: 400
    },
    {
        id: 25,
        name: "Camp Bondsteel",
        country: "Kosovo",
        branch: "USA",
        type: "Army",
        lat: 42.3597,
        lon: 21.4567,
        personnel: 7000
    },
    {
        id: 26,
        name: "Mons SHAPE HQ",
        country: "Belgium",
        branch: "NATO",
        type: "HQ",
        lat: 50.5003,
        lon: 3.9719,
        personnel: 3000
    },
    {
        id: 27,
        name: "Anderson AFB",
        country: "Guam",
        branch: "USAF",
        type: "Air Force",
        lat: 13.5839,
        lon: 144.9361,
        personnel: 9000
    },
    {
        id: 28,
        name: "Pine Gap",
        country: "Australia",
        branch: "CIA/NSA",
        type: "SIGINT",
        lat: -23.7983,
        lon: 133.7361,
        personnel: 800
    },
    {
        id: 29,
        name: "HMAS Stirling",
        country: "Australia",
        branch: "RAN",
        type: "Naval",
        lat: -32.2072,
        lon: 115.7153,
        personnel: 2400
    },
    {
        id: 30,
        name: "Ali Al Salem Air Base",
        country: "Kuwait",
        branch: "USAF",
        type: "Air Force",
        lat: 29.3467,
        lon: 47.5208,
        personnel: 2000
    },
    {
        id: 31,
        name: "Ain Assad Air Base",
        country: "Iraq",
        branch: "USAF",
        type: "Air Force",
        lat: 33.7856,
        lon: 42.4417,
        personnel: 2500
    },
    {
        id: 32,
        name: "Malstrom AFB (ICBM)",
        country: "USA",
        branch: "USAF",
        type: "Nuclear",
        lat: 47.5081,
        lon: -111.1883,
        personnel: 3500
    },
    {
        id: 33,
        name: "Minot AFB (Nuclear)",
        country: "USA",
        branch: "USAF",
        type: "Nuclear",
        lat: 48.4156,
        lon: -101.3581,
        personnel: 5000
    },
    {
        id: 34,
        name: "Büchel Air Base (B61)",
        country: "Germany",
        branch: "USAF",
        type: "Nuclear",
        lat: 50.1733,
        lon: 7.0633,
        personnel: 1500
    },
    {
        id: 35,
        name: "Volkel Air Base (B61)",
        country: "Netherlands",
        branch: "USAF",
        type: "Nuclear",
        lat: 51.6564,
        lon: 5.7083,
        personnel: 900
    },
    {
        id: 36,
        name: "Kleine Brogel (B61)",
        country: "Belgium",
        branch: "USAF",
        type: "Nuclear",
        lat: 51.1683,
        lon: 5.4700,
        personnel: 1200
    },
    {
        id: 37,
        name: "Soto Cano Air Base",
        country: "Honduras",
        branch: "USA",
        type: "Army",
        lat: 14.3828,
        lon: -87.6214,
        personnel: 500
    },
    {
        id: 38,
        name: "102nd Military Base",
        country: "Armenia",
        branch: "RUAF",
        type: "Army",
        lat: 40.7914,
        lon: 43.8469,
        personnel: 3000
    },
];