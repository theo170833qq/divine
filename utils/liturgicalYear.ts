import { LiturgicalInfo } from '../types';

// Helper to create a date in UTC to avoid timezone issues.
const createDate = (year: number, month: number, day: number): Date => {
  return new Date(Date.UTC(year, month - 1, day));
};

// Helper to add days to a date.
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

// Computus algorithm (Anonymous Gregorian) to find Easter Sunday.
const getEaster = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return createDate(year, month, day);
};

export const getLiturgicalInfo = (currentDate: Date): LiturgicalInfo => {
  // Normalize currentDate to UTC start of day
  const today = createDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
  const year = today.getUTCFullYear();
  const prevYear = year - 1;

  // --- Calculate major dates for the current year ---
  const easter = getEaster(year);
  const ashWednesday = addDays(easter, -46);
  const pentecost = addDays(easter, 49);
  const christmas = createDate(year, 12, 25);
  
  // First Sunday of Advent for the current year
  const firstSundayOfAdvent = addDays(christmas, -(christmas.getUTCDay() + 21 % 7) % 7 - 21);


  // Baptism of the Lord for the current year (Sunday after Epiphany)
  const epiphany = createDate(year, 1, 6);
  const daysUntilSunday = (7 - epiphany.getUTCDay()) % 7;
  const baptismOfLord = addDays(epiphany, daysUntilSunday > 0 ? daysUntilSunday : 7); // next sunday

  // --- Calculate dates for previous year for Christmas season check ---
  const prevYearChristmas = createDate(prevYear, 12, 25);
  
  // --- Determine Season (Order of checks is crucial) ---

  // 1. Advent: From 1st Sunday of Advent to Christmas Eve.
  if (today >= firstSundayOfAdvent && today < christmas) {
    return { season: 'Advent', color: 'purple', description: 'Tempo de preparação para o Natal.' };
  }

  // 2. Christmas: Spans from previous year's Christmas to this year's Baptism of the Lord.
  if ((today >= prevYearChristmas && today < baptismOfLord) || today >= christmas) {
    return { season: 'Christmas', color: 'white', description: 'Tempo de celebração do nascimento de Jesus.' };
  }
  
  // 3. Lent: From Ash Wednesday to Holy Thursday evening (for simplicity, until Easter).
  if (today >= ashWednesday && today < easter) {
    const palmSunday = addDays(easter, -7);
    if (today >= palmSunday) {
      return { season: 'Lent', dayName: 'Semana Santa', color: 'purple', description: 'Semana Santa, o ápice da Quaresma.' };
    }
    return { season: 'Lent', color: 'purple', description: 'Tempo de penitência, oração e conversão.' };
  }

  // 4. Easter: From Easter Sunday to Pentecost Sunday.
  if (today >= easter && today <= pentecost) {
    return { season: 'Easter', color: 'white', description: 'Tempo de celebração da Ressurreição de Cristo.' };
  }

  // 5. Ordinary Time
  return { season: 'Ordinary Time', color: 'green', description: 'Tempo Comum, vivendo o mistério de Cristo no dia a dia.' };
};
