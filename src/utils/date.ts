export function pluralize(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod100 >= 11 && mod100 <= 14) {
    return forms[2];
  }

  if (mod10 === 1) {
    return forms[0];
  }

  if (mod10 >= 2 && mod10 <= 4) {
    return forms[1];
  }

  return forms[2];
}

export const MONTH_NAMES = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export function formatJoinedDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  const absolute = `${day} ${month} ${year}`;

  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const dayCnt = Math.floor(hour / 24);
  const monthCnt = Math.floor(dayCnt / 30);
  const yearCnt = Math.floor(monthCnt / 12);

  let relative: string;

  if (sec < 60) {
    relative = "несколько секунд назад";
  } else if (min < 60) {
    relative = `${min} ${pluralize(min, ["минута", "минуты", "минут"])} назад`;
  } else if (hour < 24) {
    relative = `${hour} ${pluralize(hour, ["час", "часа", "часов"])} назад`;
  } else if (dayCnt < 30) {
    relative = `${dayCnt} ${pluralize(dayCnt, ["день", "дня", "дней"])} назад`;
  } else if (monthCnt < 12) {
    relative = `${monthCnt} ${pluralize(monthCnt, ["месяц", "месяца", "месяцев"])} назад`;
  } else {
    relative = `${yearCnt} ${pluralize(yearCnt, ["год", "года", "лет"])} назад`;
  }

  return `${absolute} (${relative})`;
}

export function formatEventDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((target.getTime() - today.getTime()) / msPerDay);

  let prefix: string;
  if (diffDays === 0) {
    prefix = "сегодня";
  } else if (diffDays === 1) {
    prefix = "завтра";
  } else if (diffDays === 2) {
    prefix = "послезавтра";
  } else {
    prefix = "";
  }

  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  const datePart = `${day} ${month}`;
  const timePart = `в ${hours}:${minutes}`;

  return prefix
    ? `${prefix} ${datePart} ${timePart}`
    : `${datePart} ${timePart}`;
}
