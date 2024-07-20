import { Injectable } from '@nestjs/common';
import { Action, Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { CustomContext } from 'src/context/context';
import { getCalendarKeyboard } from 'src/lib/calendar';
import { getTimeKeyboard } from 'src/lib/timeKeyboard';
import { AppService } from 'src/services/app.service';
import { MessageService } from 'src/services/message.service';
import { Markup } from 'telegraf';

@Injectable()
@Scene('postScene')
export class PostScene {
  constructor(
    private readonly messageService: MessageService,
    private readonly appService: AppService,
  ) {}

  @SceneEnter()
  async start(@Ctx() ctx: CustomContext) {
    try {
      const user = ctx.from;
      const username = user.username || user.first_name;
      const isAdmin = username === 'LoraSher';
      if (isAdmin) {
        const now = new Date();
        const calendarKeyboard = getCalendarKeyboard(
          now.getFullYear(),
          now.getMonth(),
        );
        await ctx.replyWithHTML('Выберете дату:', calendarKeyboard);
      } else {
        await ctx.reply('Простите, вы не администратор');
        await ctx.scene.leave();
      }
    } catch (error) {
      console.error('Error in startCommand:', error);
      await ctx.reply('Произошла ошибка при обработке вашего запроса.');
    }
  }

  @Action(/day_\d+/) // Regular expression to match day callbacks like 'day_1', 'day_2', etc.
  async handleDaySelection(@Ctx() ctx: CustomContext) {
    const callbackQuery = ctx.callbackQuery;
    if ('data' in callbackQuery) {
      const callbackData = callbackQuery.data;
      const selectedDay = callbackData.replace('day_', '');

      // Получение текущего месяца и года
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1; // Месяцы в JavaScript нумеруются с нуля, поэтому январь это 0
      ctx.scene.session.selectedDay = selectedDay;
      ctx.scene.session.selectedMonth = month.toString();
      ctx.scene.session.selectedYear = year.toString();
      await ctx.reply(`Выбрана дата: ${selectedDay}.${month}.${year}`);
      const timeKeyboard = getTimeKeyboard();
      await ctx.reply('Выберите время:', timeKeyboard);
    } else {
      await ctx.reply('Ошибка: некорректный callbackQuery.');
    }
  }

  @Action(/hour_\d+/)
  async selectHour(@Ctx() ctx: CustomContext) {
    const callbackQuery = ctx.callbackQuery;
    if ('data' in callbackQuery) {
      const hour = callbackQuery.data.replace('hour_', ''); // Извлекаем выбранный час
      ctx.scene.session.selectedHour = hour; // Сохраняем выбранный час в сессии или базе данных

      const minuteKeyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback('00', 'minute_00'),
          Markup.button.callback('15', 'minute_15'),
          Markup.button.callback('30', 'minute_30'),
          Markup.button.callback('45', 'minute_45'),
        ],
      ]);
      await ctx.reply('Теперь выберите минуты:', minuteKeyboard);
    } else {
      await ctx.reply('Ошибка: некорректный callbackQuery.');
    }
  }

  @Action(/^(prev_month|next_month)_.+$/)
  async handleMonthNavigation(@Ctx() ctx: CustomContext) {
    const callbackQuery = ctx.callbackQuery;
    if ('data' in callbackQuery) {
      const callbackData = callbackQuery.data;
      console.log('Received callback data:', callbackData); // Debugging line

      // Используем регулярное выражение для четкого парсинга action, year и month
      const match = callbackData.match(/^(prev_month|next_month)_(\d+)_(\d+)$/);

      if (match) {
        const action = match[1];
        const year = parseInt(match[2], 10);
        const month = parseInt(match[3], 10);

        console.log(`Action: ${action}, Year: ${year}, Month: ${month}`); // Debugging line

        let newYear = year;
        let newMonth = month;

        if (action === 'prev_month') {
          newMonth -= 1;
          if (newMonth < 0) {
            newMonth = 11;
            newYear -= 1;
          }
        } else if (action === 'next_month') {
          newMonth += 1;
          if (newMonth > 11) {
            newMonth = 0;
            newYear += 1;
          }
        }

        const calendarKeyboard = getCalendarKeyboard(newYear, newMonth);
        await ctx.editMessageReplyMarkup(calendarKeyboard.reply_markup);
      } else {
        console.error('Error parsing callback data:', callbackData);
      }
    }
  }

  @Action(/minute_\d+/)
  async selectMinute(@Ctx() ctx: CustomContext) {
    const callbackQuery = ctx.callbackQuery;
    if ('data' in callbackQuery) {
      const selectedMinute = callbackQuery.data.replace('minute_', '');
      ctx.scene.session.selectedMinute = selectedMinute;

      // Отображение выбранного времени
      const selectedDay = ctx.scene.session.selectedDay;
      const selectedMonth = ctx.scene.session.selectedMonth;
      const selectedYear = ctx.scene.session.selectedYear;
      const selectedHour = ctx.scene.session.selectedHour;
      const selectMinute = ctx.scene.session.selectedMinute;
      const formattedDate = `${selectedDay}.${selectedMonth}.${selectedYear}`;
      const formattedTime = `${selectedHour}:${selectMinute}`;

      await ctx.reply(`Выбранное время: ${formattedDate} ${formattedTime}`);
      await ctx.reply('Загрузите пост с фото или видео через скрепку.');
    } else {
      await ctx.reply('Ошибка: некорректный callbackQuery.');
    }
  }

  @On('photo')
  async addFile(@Ctx() ctx: CustomContext) {
    try {
        console.log('Adding', ctx.message);
      await this.messageService.handlePostMessage(ctx);
      const user = ctx.from;
      const username = user.username || user.first_name;
      await ctx.reply('Файл загружен. Введите текст для поста.');
    } catch (error) {
      console.error('Error handling file upload:', error);
      await ctx.reply('Произошла ошибка при загрузке файла.');
    }
  }

  @On('text')
  async handleText(@Ctx() ctx: CustomContext) {
    if (ctx.message && 'text' in ctx.message) {
      ctx.scene.session.postText = ctx.message.text;
      await ctx.reply(
        'Текст поста сохранен. Запланировать пост?',
        Markup.inlineKeyboard([
          Markup.button.callback('Запланировать', 'confirm_schedule'),
          Markup.button.callback('Редактировать', 'change_schedule'),
        ]),
      );
    } else {
      await ctx.reply('Ошибка: некорректный текст.');
    }
  }

  @Action('confirm_schedule')
  async confirmSchedule(@Ctx() ctx: CustomContext) {
    const { fileId, fileName, fileLink, scheduledDate, postText } =
      ctx.scene.session;

    await this.appService.saveScheduledPost({
      fileId,
      fileName,
      fileLink,
      scheduledDate,
      postText,
    });

    await ctx.reply('Пост успешно сохранен.');
    await ctx.scene.leave();
    await ctx.scene.enter('adminScene');
  }

  @Action('change_schedule')
  async changeSchedule(@Ctx() ctx: CustomContext) {
    await ctx.reply('Изменение расписания. Начните процесс заново.');
    await ctx.scene.leave();
    await ctx.scene.enter('adminScene');
  }
}
