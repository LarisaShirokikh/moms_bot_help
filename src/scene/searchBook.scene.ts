import { Injectable } from '@nestjs/common';
import { Action, Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { CustomContext } from 'src/context/context';
import { AppService } from 'src/services/app.service';
import { MessageService } from 'src/services/message.service';
import { actionBottons } from '../keyboards/keyboard';

@Injectable()
@Scene('searchBookScene')
export class SearchBookScene {
  constructor(
    private readonly messageService: MessageService, //private readonly userSessionService: UserSessionStorageService
    private readonly appService: AppService,
  ) {}

  @SceneEnter()
  async start(@Ctx() ctx: CustomContext) {
    await ctx.replyWithHTML('⤵️ Напишите название учебника ⤵️');
  }

  @On('message')
  async searchBook(@Ctx() ctx: CustomContext) {
    try {
      await this.messageService.handleTextMessage(ctx);
    } catch (error) {
      console.error('Ошибка поиска:', error);
    }
  }

  @Action(/file_\d+/)
  async handleFileCallback(@Ctx() ctx: CustomContext) {
    const callbackQuery = ctx.callbackQuery;
    if ('data' in callbackQuery) {
      const callbackData = callbackQuery.data;
      const fileIndex = parseInt(callbackData.split('_')[1], 10);

      const foundBooks = ctx.scene.session.foundBooks;
      if (foundBooks && foundBooks[fileIndex]) {
        const book = foundBooks[fileIndex];

        const file = await this.appService.getNextFileToId(book.fileId);
        await ctx.telegram.sendDocument(ctx.chat.id, file.fileId);

        // Предложить вернуться в главное меню
        await ctx.reply('Хотите вернуться в главное меню?', {
          reply_markup: {
            inline_keyboard: [[{ text: 'Да', callback_data: 'main_menu' }]],
          },
        });
      } else {
        await ctx.reply('Ошибка: файл не найден.');
      }
    } else {
      await ctx.reply('Ошибка: некорректный callbackQuery.');
    }
  }

  @Action('main_menu')
  async returnToMainMenu(@Ctx() ctx: CustomContext) {
    const user = ctx.from;
    const username = user.username || user.first_name;
    // Логика для возвращения в главное меню
    await ctx.reply(
      `Хорошо! ${username}! Что будем делать дальше?`,
      actionBottons(),
    );
  }
}
