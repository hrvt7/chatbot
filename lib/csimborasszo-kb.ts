export const csimborasszoKb = {
  appName:
    process.env.NEXT_PUBLIC_APP_NAME ?? "Csimborasszó asszisztens (teszt)",
  contact: {
    address: "9700 Szombathely, Vízöntő utca 7.",
    phone: "+36 (94) 900 261",
    email: "info@csimborasszo.hu",
    hours: "Hétfőtől–Péntekig: 08:00–19:00",
  },
  booking: {
    bookingUrl: "https://csimborasszo.hu/idopontfoglalas/",
  },
  specialties: {
    adult: [
      "Allergológia",
      "Angiológia",
      "Érsebészet",
      "Bőrgyógyászat",
      "Belgyógyászat",
      "Diabetológia",
      "Endokrinológia",
      "Fül-orr-gégészet",
      "Gasztroenterológia",
      "Hematológia",
      "Infektológia",
      "Kardiológia",
      "Nőgyógyászat",
      "Nephrológia",
      "Neurológia",
      "Onkológia",
      "Ortopédia",
      "Reumatológia",
      "Sebészet",
      "Szemészet",
      "Tüdőgyógyászat",
      "Traumatológia",
      "Urológia",
    ],
    child: [
      "Gyermek gasztroenterológia",
      "Gyermek kardiológia",
      "Gyermek neurológia",
      "Gyermekgyógyászat",
    ],
    therapies: [
      "Dévény módszer",
      "Schroth terápia",
      "Manuálterápia",
      "McKenzie torna",
      "Gyógymasszázs",
      "Pszichológia",
      "Dietetika",
      "Logopédia",
    ],
  },
  screeningPackages: [
    {
      name: "Optimum",
      recommendation: "35+ év, évente",
      price: "210000 Ft",
      includes:
        "lab, mellkas röntgen, nyaki erek/has/kismedence UH, anyajegyszűrés, kardiológia (EKG+szív UH), szemészet, belgyógyászati konzultáció",
    },
    {
      name: "Maximum",
      recommendation: "40+ év, évente",
      price: "340000 Ft",
      includes:
        "optimum + pajzsmirigy UH, terheléses EKG, ortopédia, nőgyógyászat/urológia, bővebb labor tumormarkerekkel",
    },
    {
      name: "Kardiológiai csomag",
      recommendation: "30+ év, évente",
      price: "49000 Ft",
    },
    {
      name: "Kardiológiai plusz",
      recommendation: "30+ év, évente",
      price: "69000 Ft",
    },
    {
      name: "Női csomag",
      recommendation: "21+ év, évente",
      price: "56000 Ft",
    },
    {
      name: "Férfi csomag",
      recommendation: "45+ év, évente",
      price: "40000 Ft",
    },
    {
      name: "Gasztroenterológiai csomag",
      recommendation: "45+ év, 2 évente",
      price: "125000 Ft",
      includes:
        "vastagbéltükrözés bódításban + 1 szövettan; beavatkozások felára külön",
    },
  ],
  selectedPriceItems: [
    "Traumatológiai szakorvosi vizsgálat 28 500 Ft; kontroll 21 400 Ft; vizsgálat és beavatkozás 35 500 Ft",
    "Ortopédiai szakorvosi vizsgálat 28 500 Ft; kontroll 21 400 Ft; vizsgálat+beavatkozás 35 500 Ft",
    "Urológiai alap vizsgálat 28 500 Ft; kontroll 21 400 Ft",
    "Fül-orr-gégészeti vizsgálat 28 500 Ft; kontroll 21 400 Ft",
    "Emlő ultrahang 28 000 Ft; hasi UH 25 000 Ft; pajzsmirigy UH 25 000 Ft",
  ],
} as const;
