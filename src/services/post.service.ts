import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { AppService } from './app.service';

//const chat_id = -1001311038605; умница это


@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly appService: AppService,
  ) {}
  private currentFileId: string | undefined;

  // async sendPostButtons(ctx: Context) {
  //   const buttons = [
  //     { text: 'Опубликовать', callback_data: 'publish_post' },
  //     { text: 'Запланировать', callback_data: 'schedule_post' },
  //   ];

  //   await ctx.reply('Выберите действие:', {
  //     reply_markup: {
  //       inline_keyboard: [buttons],
  //     },
  //   });
  // }

  // async publishPost(ctx: Context, fileId: string) {
  //   // Опубликовать текущий пост, используя переданный fileId
  //   if (fileId) {
  //     await ctx.reply(`Пост с файлом ${fileId} опубликован.`);
  //   } else {
  //     await ctx.reply('Ошибка: файл не найден для опубликования.');
  //   }
  // }

 

  async handleScheduledPost(ctx: Context) {
    this.logger.log(`CHAT_ID_TEST: ${process.env.CHAT_ID_TEST}`);

    const now = new Date();
    const currentHour = now.getHours();
    // Check if current time is within working hours (e.g., between 9 AM and 5 PM)
    if (currentHour >= 6 && currentHour < 23) {
      const file = await this.appService.getNextFileToPost();

      if (file) {
        const caption =
          `📚 <b>${file.fileName}</b>\n\n` +
          // `🐣 <a href="https://t.me/malichata">Подписывайся на канал для малышей</a>\n` +
          `🤖 <a href="https://t.me/botsolutionone/1">Хочешь свой телеграмм-бот? Канал с кейсами разработки</a>`;

        await ctx.telegram.sendDocument(
          process.env.CHAT_ID_UMNIZA,
          file.fileId,
          {
            caption,
            parse_mode: 'HTML',
          },
        );
        
        await this.appService.markFileAsPosted(file.id);
      }
    } else {
      console.log('Outside working hours. Skipping scheduled post.');
    }
  }


}
