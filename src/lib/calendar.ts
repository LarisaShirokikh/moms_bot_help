import { Markup } from 'telegraf';

// Interface for the button object
interface ButtonObject {
  text: string;
  callback_data: string;
}

// Function to get days in a month
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Function to get the day of the week for the first day of the month (0 - Sunday, 1 - Monday, ..., 6 - Saturday)
// We need to adjust it so that 0 is Monday, 1 is Tuesday, ..., 6 is Sunday
function getStartDay(year: number, month: number): number {
  const startDay = new Date(year, month, 1).getDay();
  return startDay === 0 ? 6 : startDay - 1; // Adjusting Sunday to be at the end
}

// Function to generate calendar
export function generateCalendar(year: number, month: number) {
  console.log(`Generating calendar for year: ${year}, month: ${month}`); // Debugging line
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getStartDay(year, month);
  const today = new Date();
  const weeks: ButtonObject[][] = [];

  // Days of the week for the calendar header
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Header with month and year
  const monthName = new Date(year, month).toLocaleString('ru-RU', {
    month: 'long',
  });
  const header: ButtonObject[] = [
    { text: `${monthName} ${year}`, callback_data: 'ignore' },
  ];
  weeks.push(header);

  // Add day labels above days
  const dayLabels = weekDays.map((day) => ({
    text: day,
    callback_data: 'ignore',
  }));
  weeks.push(dayLabels);

  // Fill the first week
  let currentWeek: ButtonObject[] = [];
  for (let i = 0; i < startDay; i++) {
    currentWeek.push({ text: ' ', callback_data: 'ignore' });
  }

  // Fill the days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day;
    const dayButton: ButtonObject = {
      text: isToday ? `*${day}*` : day.toString(),
      callback_data: `day_${day}`,
    };
    currentWeek.push(dayButton);

    // Start a new week when we reach the end of the current week
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill the last week
  while (currentWeek.length < 7) {
    currentWeek.push({ text: ' ', callback_data: 'ignore' });
  }
  weeks.push(currentWeek);

  // Add navigation buttons for switching months
  const navigationButtons: ButtonObject[] = [
    { text: '◀️', callback_data: `prev_month_${year}_${month}` },
    { text: '▶️', callback_data: `next_month_${year}_${month}` },
  ];
  weeks.push(navigationButtons);

  console.log('Generated weeks:', weeks); // Debugging line

  return weeks;
}

// Function to get calendar keyboard
export function getCalendarKeyboard(year: number, month: number) {
  console.log(`Generating calendar for Year: ${year}, Month: ${month}`); // Debugging line
  const weeks = generateCalendar(year, month);
  return Markup.inlineKeyboard(weeks);
}
