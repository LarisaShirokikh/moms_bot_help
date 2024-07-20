import { Markup } from 'telegraf';

// Функция для генерации inline клавиатуры выбора времени
export function getTimeKeyboard() {
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0'),
  );
  const minutes = ['00', '15', '30', '45']; // Минуты, которые можно выбрать

  const buttons = hours.map((hour) =>
    Markup.button.callback(hour, `hour_${hour}`),
  );

  const rows = [];
  while (buttons.length > 0) {
    rows.push(buttons.splice(0, 6)); // Разбиваем кнопки по 6 в строку
  }

  rows.push(
    minutes.map((minute) => Markup.button.callback(minute, `minute_${minute}`)),
  );

  return Markup.inlineKeyboard(rows);
}
