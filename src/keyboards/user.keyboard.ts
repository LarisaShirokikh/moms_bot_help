import { Markup } from 'telegraf';

export const actionBottonsForUser = () => {
  return Markup.keyboard(
    [
      Markup.button.text('Добавить файл'),
      Markup.button.text('🕵️‍♀️ Найти учебник'),
      Markup.button.text('Создать пост'),
      Markup.button.text('Запланировать пост'),
    ],
    {
      columns: 3,
    },
  ).resize();
};
