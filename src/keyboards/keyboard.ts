import { Markup } from 'telegraf';

export const bottonsForAdmin = () => {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback('🚗 Автопост', 'auto_post'),
      Markup.button.callback('🗂️ Добавить учебник', 'add_book'),
      Markup.button.callback('📅 Расписание', 'schedule'),
      Markup.button.callback('✍🏻 Запланировать пост', 'add_schedule'),
    ],
    { columns: 1 },
  );
};

export const actionBottons = ( ) => {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback('🕵️‍♀️ Я ищу учебник', 'search_book'),
      Markup.button.callback('💬 Я хочу попасть в чат', 'chat'),
      Markup.button.callback('💰 Нужна информация по рекламе', 'adv'),
      Markup.button.callback('💵 Я хочу оформить подписку', 'subscribe'),
    ],
    { columns: 1 },
  );
}
