import { Injectable } from '@nestjs/common';
import { Action, Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { CustomContext } from 'src/context/context';
import { actionBottons } from '../keyboards/keyboard';
import { MessageService } from 'src/services/message.service';
import { AppService } from 'src/services/app.service';
import { SubscriptionService } from 'src/services/subscription.service';

@Injectable()
@Scene('userScene')
export class UserScene {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly messageService: MessageService, //private readonly userSessionService: UserSessionStorageService
    private readonly appService: AppService,
  ) {}

  @SceneEnter()
  async start(@Ctx() ctx: CustomContext) {
    const user = ctx.from;
    const username = user.username || user.first_name;
    await ctx.reply(`${username} Что будем делать?`, actionBottons());
  }

  @Action('back_botton')
  async comeback(@Ctx() ctx: CustomContext) {
    await ctx.scene.leave();
  }

  @Action('search_book')
  async handleAddAutoPost(@Ctx() ctx: CustomContext) {
    await ctx.replyWithHTML('⤵️ Напишите название учебника или автора ⤵️');
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

        const user = ctx.from;
        const username = user.username || user.first_name;
        await ctx.reply(
          `${username} Что что то еще будем делать?`,
          actionBottons(),
        );
      } else {
        await ctx.reply('Ошибка: файл не найден.');
      }
    } else {
      await ctx.reply('Ошибка: некорректный callbackQuery.');
    }
  }

  @Action('subscribe')
  async handleSubscribe(@Ctx() ctx: CustomContext) {
    const userId = ctx.from.id;
    const channelId = 'YOUR_PRIVATE_CHANNEL_ID'; // Замените на ваш ID канала

    const isSubscribed = await this.subscriptionService.isSubscribed(
      userId,
      channelId,
    );
    if (isSubscribed) {
      await ctx.reply('Вы уже подписаны на канал.');
    } else {
      await this.subscriptionService.createSubscription(userId, channelId);
      const inviteLink =
        await this.subscriptionService.getSubscriptionInviteLink();
      await ctx.reply(
        `Вы подписаны! Вот ваша ссылка для присоединения к каналу: ${inviteLink}`,
      );
    }
  }
}
