export const emergencyText =
  "Ha mellkasi fájdalom, légszomj, féloldali gyengeség, erős vérzés, eszméletvesztés, súlyos allergiás reakció vagy hirtelen romló állapot áll fenn, azonnal hívja a 112-t.";

const redFlagKeywords = [
  "mellkasi fájdalom",
  "légszomj",
  "féloldali gyengeség",
  "erős vérzés",
  "eszméletvesztés",
  "allergiás reakció",
  "hirtelen romló",
];

export function hasEmergencyRedFlag(text: string) {
  const normalized = text.toLocaleLowerCase("hu-HU");
  return redFlagKeywords.some((keyword) => normalized.includes(keyword));
}
