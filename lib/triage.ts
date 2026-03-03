const triageKeywords = [
  { keywords: ["térd", "derék", "ízület"], target: "Ortopédia vagy Reumatológia" },
  { keywords: ["sérülés", "rándulás", "törés"], target: "Traumatológia" },
  { keywords: ["bőr", "anyajegy", "kiütés"], target: "Bőrgyógyászat" },
  { keywords: ["vizelés", "prosztata"], target: "Urológia" },
  { keywords: ["szív", "magas vérnyomás", "szívdobogás"], target: "Kardiológia" },
  { keywords: ["hasi fájdalom", "gyomor", "hasmenés"], target: "Gasztroenterológia" },
  { keywords: ["fül", "orr", "torok"], target: "Fül-orr-gégészet" },
  { keywords: ["szem"], target: "Szemészet" },
  { keywords: ["nőgyógy"], target: "Nőgyógyászat" },
  { keywords: ["zsibbadás", "tartós fejfájás"], target: "Neurológia" },
  { keywords: ["cukor"], target: "Diabetológia" },
  { keywords: ["pajzsmirigy"], target: "Endokrinológia" },
] as const;

export function suggestSpecialtiesFromText(input: string) {
  const normalized = input.toLocaleLowerCase("hu-HU");

  return triageKeywords
    .filter((entry) => entry.keywords.some((keyword) => normalized.includes(keyword)))
    .map((entry) => entry.target);
}
