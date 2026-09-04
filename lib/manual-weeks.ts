// Week dates for manually-entered rows (Kevin's Evolve MPD card): every Thursday, starting from
// last week — the most recently completed week, not the in-progress one.

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const c = new Date(d);
  c.setUTCDate(c.getUTCDate() + n);
  return c;
};

/** Thursdays going back from last week's (the most recently completed week), newest first. */
export function recentThursdays(count: number, from = new Date()): string[] {
  const dow = (from.getUTCDay() + 6) % 7; // Monday=0 .. Sunday=6
  const monday = addDays(from, -dow);
  const lastWeekThursday = addDays(monday, -4); // Thursday of the ISO week before this one
  return Array.from({ length: count }, (_, i) => iso(addDays(lastWeekThursday, -7 * i)));
}
