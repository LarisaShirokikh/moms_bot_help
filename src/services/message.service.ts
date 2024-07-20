import { Injectable } from '@nestjs/common';
import { Context, Telegraf } from 'telegraf';
import { CustomContext } from '../context/context';
import { InjectBot } from 'nestjs-telegraf';
import { AppService } from './app.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly appService: AppService,
  ) {}

  async handlePostMessage(ctx: CustomContext) {
    try {
      if (ctx.message && 'document' in ctx.message) {
        const fileId = ctx.message.document.file_id;
        const fileName = ctx.message.document.file_name;
        const fileLink = await ctx.telegram.getFileLink(fileId);

        ctx.scene.session.fileId = fileId;
        ctx.scene.session.fileName = fileName;
        ctx.scene.session.fileLink = fileLink.href;

        const {
          selectedDay,
          selectedMonth,
          selectedYear,
          selectedHour,
          selectedMinute,
        } = ctx.scene.session;
        const scheduledDate = new Date(
          parseInt(selectedYear),
          parseInt(selectedMonth) - 1,
          parseInt(selectedDay),
          parseInt(selectedHour),
          parseInt(selectedMinute),
        );

        ctx.scene.session.scheduledDate = scheduledDate;

        await ctx.reply(
          `Файл ${fileName} успешно сохранен и запланирован на ${scheduledDate}.`,
        );
      }
    } catch (error) {
      console.error('Error handling document message:', error);
      await ctx.reply('Произошла ошибка при обработке вашего файла.');
    }
  }

  async handleDocumentMessage(ctx: CustomContext) {
    try {
      if (ctx.message && 'document' in ctx.message) {
        const fileId = ctx.message.document.file_id;
        const fileName = ctx.message.document.file_name;

        // Получаем ссылку на файл
        const fileLink = await ctx.telegram.getFileLink(fileId);

        // Сохраняем файл в базе данных через AppService
        await this.appService.saveFile(fileId, fileName, fileLink.href);

        await ctx.reply(`Файл ${fileName} успешно сохранен.`);
      } else {
        await ctx.reply('Пожалуйста, загрузите файл через интерфейс скрепка.');
      }
    } catch (error) {
      console.error('Error handling document message:', error);

      if (
        error.response &&
        error.response.description &&
        error.response.description.includes('file is too big')
      ) {
        await ctx.reply(
          'Ошибка: Загруженный файл слишком большой. Пожалуйста, загрузите файл размером до 50 MB.',
        );
      } else {
        await ctx.reply('Произошла ошибка при загрузке вашего файла.');
      }
    }
  }

  async handleTextMessage(ctx: CustomContext) {
    try {
      if (ctx.message && 'text' in ctx.message) {
        const searchText = ctx.message.text.trim();
        console.log('Searching for books with text:', searchText);

        // Ищем учебник в базе данных
        const foundBooks = await this.appService.findBookByTextSearch(
          searchText,
        );
        console.log('Found books:', foundBooks);

        if (foundBooks.length > 0) {
          const buttons = foundBooks.map((book, index) => ({
            text: `${index + 1}. ${book.fileName}`,
            callback_data: `file_${index}`,
          }));

          const inlineKeyboard = {
            inline_keyboard: buttons.map((button) => [button]),
          };

          await ctx.reply('Найдены учебники:', {
            reply_markup: inlineKeyboard,
          });

          ctx.scene.session.foundBooks = foundBooks;
        } else {
          await ctx.reply(`По запросу "${searchText}" учебники не найдены.`);
        }
      }
    } catch (error) {
      console.error('Error in handleTextMessage:', error);

      if (error.response && error.response.description) {
        console.error('Telegram API Error:', error.response.description);
      }

      await ctx.reply('Произошла ошибка при поиске учебника.');
    }
  }

  async handlePhotoWithCaptionMessage(ctx: CustomContext) {
    try {
      if (ctx.message && 'photo' in ctx.message && 'caption' in ctx.message) {
        const photo = ctx.message.photo[ctx.message.photo.length - 1]; // Берем самое большое фото
        const fileId = photo.file_id;
        const caption = ctx.message.caption;
        const fileLink = await ctx.telegram.getFileLink(fileId);
        const timePost = new Date();

        // Сохраняем фото и его описание в базе данных через AppService
        await this.appService.savePhoto(
          fileId,
          fileLink.href,
          caption,
          timePost,
        );

        await ctx.reply(`Фото с описанием "${caption}" успешно сохранено.`, {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Опубликовать пост', callback_data: 'publish_post' }],
              [{ text: 'Запланировать пост', callback_data: 'schedule_post' }],
              [{ text: '🔙 Вернуться в главное меню', callback_data: 'back' }],
            ],
          },
        });
      } else {
        await ctx.reply('Пожалуйста, загрузите фото с текстовым описанием.');
      }
    } catch (error) {
      console.error('Error handling photo with caption message:', error);

      if (
        error.response &&
        error.response.description &&
        error.response.description.includes('file is too big')
      ) {
        await ctx.reply(
          'Ошибка: Загруженный файл слишком большой. Пожалуйста, загрузите файл размером до 50 MB.',
        );
      } else {
        await ctx.reply('Произошла ошибка при загрузке вашего фото.');
      }
    }
  }

  async schedulePost(ctx: Context, fileId: string, scheduledDate: Date) {
    // Запланировать текущий пост, используя переданный fileId
    if (fileId) {
      await ctx.reply(`Пост с файлом ${fileId} запланирован.`);
    } else {
      await ctx.reply('Ошибка: файл не найден для запланирования.');
    }
  }
}
