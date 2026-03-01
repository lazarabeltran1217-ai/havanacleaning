/**
 * Eastern Time utilities for Havana Cleaning.
 *
 * The business operates in Miami (America/New_York).
 * All date boundary calculations (today, this week, this month) should use
 * Eastern Time so dashboards, schedules, and booking numbers align with
 * the real-world business day.
 */

const TZ = "America/New_York";

/**
 * Returns the current date/time interpreted in Eastern Time.
 * The returned Date object has its UTC fields set so that
 * getFullYear/getMonth/getDate/getHours reflect ET values.
 */
export function nowET(): Date {
  const str = new Date().toLocaleString("en-US", { timeZone: TZ });
  return new Date(str);
}

/** Midnight today in Eastern Time (as a UTC timestamp Prisma can use). */
export function todayStartET(): Date {
  const et = nowET();
  return new Date(Date.UTC(et.getFullYear(), et.getMonth(), et.getDate()));
}

/** Midnight tomorrow in Eastern Time. */
export function tomorrowStartET(): Date {
  const et = nowET();
  return new Date(Date.UTC(et.getFullYear(), et.getMonth(), et.getDate() + 1));
}

/** Start of the current month in Eastern Time. */
export function monthStartET(): Date {
  const et = nowET();
  return new Date(Date.UTC(et.getFullYear(), et.getMonth(), 1));
}

/** Start of a given month offset from current month (0 = this month, -1 = last month). */
export function monthStartOffsetET(offset: number): Date {
  const et = nowET();
  return new Date(Date.UTC(et.getFullYear(), et.getMonth() + offset, 1));
}

/** Monday 00:00 of the current week in Eastern Time. */
export function weekStartET(): Date {
  const et = nowET();
  const day = et.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(Date.UTC(et.getFullYear(), et.getMonth(), et.getDate() + diff));
}

/** Today's date string as YYYYMMDD in Eastern Time (for booking numbers). */
export function todayDateStringET(): string {
  const et = nowET();
  return (
    et.getFullYear().toString() +
    String(et.getMonth() + 1).padStart(2, "0") +
    String(et.getDate()).padStart(2, "0")
  );
}

/** Today's date as YYYY-MM-DD in Eastern Time (for date inputs). */
export function todayISODateET(): string {
  const et = nowET();
  return `${et.getFullYear()}-${String(et.getMonth() + 1).padStart(2, "0")}-${String(et.getDate()).padStart(2, "0")}`;
}

/** Tomorrow's date as YYYY-MM-DD in Eastern Time (for minimum booking date). */
export function tomorrowISODateET(): string {
  const et = nowET();
  const tm = new Date(et.getFullYear(), et.getMonth(), et.getDate() + 1);
  return `${tm.getFullYear()}-${String(tm.getMonth() + 1).padStart(2, "0")}-${String(tm.getDate()).padStart(2, "0")}`;
}
