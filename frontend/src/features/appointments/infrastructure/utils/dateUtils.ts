export function getTodayDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function createLocalDate(year: number, month: number, day: number): Date {
  // Create a date at midnight local time without timezone offset issues
  const date = new Date(year, month, day, 0, 0, 0, 0);
  // Ensure hours are exactly 0
  date.setHours(0, 0, 0, 0);
  return date;
}

export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
