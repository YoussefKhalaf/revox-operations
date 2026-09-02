const CAIRO_TIME_ZONE = "Africa/Cairo";

export type DashboardPeriod =
  | {
      mode: "month";
      label: string;
      monthParam: string;
      startDate: string;
      endDate: string;
    }
  | {
      mode: "all";
      label: string;
      startDate: null;
      endDate: null;
    };

function getCairoYearMonth(date: Date): { year: number; month: number } {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: CAIRO_TIME_ZONE,
    year: "numeric",
    month: "numeric",
  });

  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value ?? "0");
  const month = Number(parts.find((part) => part.type === "month")?.value ?? "0");

  return { year, month };
}

function formatMonthStart(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

function formatMonthParam(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getCurrentCairoMonthStart(): string {
  const { year, month } = getCairoYearMonth(new Date());
  return formatMonthStart(year, month);
}

export function getNextMonthStart(monthStart: string): string {
  const [year, month] = monthStart.split("-").map(Number);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return formatMonthStart(nextYear, nextMonth);
}

export function addMonthsToMonthStart(monthStart: string, offset: number): string {
  const [year, month] = monthStart.split("-").map(Number);
  const absolute = year * 12 + (month - 1) + offset;
  const nextYear = Math.floor(absolute / 12);
  const nextMonth = (absolute % 12) + 1;
  return formatMonthStart(nextYear, nextMonth);
}

export function formatMonthLabel(monthStart: string): string {
  const [year, month] = monthStart.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(date);
}

function parseMonthParam(value: string | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month] = value.split("-").map(Number);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  return formatMonthStart(year, month);
}

export function parseDashboardPeriod(searchParams: {
  month?: string;
  period?: string;
}): DashboardPeriod {
  if (searchParams.period === "all") {
    return {
      mode: "all",
      label: "All Time",
      startDate: null,
      endDate: null,
    };
  }

  const currentMonthStart = getCurrentCairoMonthStart();
  const monthStart = parseMonthParam(searchParams.month) ?? currentMonthStart;
  const [year, month] = monthStart.split("-").map(Number);

  return {
    mode: "month",
    label: formatMonthLabel(monthStart),
    monthParam: formatMonthParam(year, month),
    startDate: monthStart,
    endDate: getNextMonthStart(monthStart),
  };
}

export function getMonthlyPerformanceRange(): {
  startMonth: string;
  endDate: string;
} {
  const currentMonthStart = getCurrentCairoMonthStart();
  const startMonth = addMonthsToMonthStart(currentMonthStart, -11);

  return {
    startMonth,
    endDate: getNextMonthStart(currentMonthStart),
  };
}

export function formatMonthHeading(monthStart: string): string {
  return formatMonthLabel(monthStart);
}
