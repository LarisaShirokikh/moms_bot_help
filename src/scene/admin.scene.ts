import { Injectable, UseGuards } from '@nestjs/common';
import { Action, Ctx, Hears, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { CustomContext } from 'src/context/context';
import { bottonsForAdmin } from 'src/keyboards/keyboard';
import { PostService } from 'src/services/post.service';
import { Markup } from 'telegraf';
import { MessageService } from 'src/services/message.service';
import { AppService } from 'src/services/app.service';

@Injectable()
@Scene('adminScene')
export class AdminScene {
  private donorChannelId: string;
  constructor(
    private readonly postService: PostService,
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
        await ctx.reply(`${username} Что будем делать?`, bottonsForAdmin());
      } else {
        await ctx.reply('Простите, вы не администратор');
        await ctx.scene.leave();
      }
    } catch (error) {
      console.error('Error in startCommand:', error);
      await ctx.reply('Произошла ошибка при обработке вашего запроса.');
    }
  }

  @Action('send_schedule_message')
  async sendSchedule(@Ctx() ctx: CustomContext) {
    const user = ctx.from;
    const username = user.username || user.first_name;
    await ctx.reply(`${username} Введите номер чата-донора`);
    // ctx.scene.session.state = 'waiting_for_channel_id';
  }

  @Hears(/.+/)
  async handleChannelInput(@Ctx() ctx: CustomContext) {
    // if (ctx.scene.session.state === 'waiting_for_channel_id') {
    const message = ctx.message as any;
    if (message && message.text) {
      this.donorChannelId = message.text;
      //ctx.scene.session.state = null;
      await ctx.reply(`ID канала-донора установлен: ${this.donorChannelId}`);
      // await this.appService.collectAndLogMembers(this.donorChannelId);
      //  }
    }
  }

  @Action('auto_post')
  async enterAutoPost(@Ctx() ctx: CustomContext) {
    const buttons = Markup.inlineKeyboard([
      Markup.button.callback('🚗 Запустить автопост', 'add_auto_post'),
      Markup.button.callback('🛑 Остановить автопост', 'stop_auto_post'),
    ]);

    await ctx.replyWithHTML('Запускаем автопостинг?', buttons);
  }

  @Action('add_auto_post')
  async handleAddAutoPost(@Ctx() ctx: CustomContext) {
    await this.postService.scheduleAutoPost(ctx);
    await ctx.replyWithHTML('Автопостинг запущен.');
    const user = ctx.from;
    const username = user.username || user.first_name;
    await ctx.reply(
      `${username} Что что то еще будем делать?`,
      bottonsForAdmin(),
    );
  }

  @Action('add_schedule')
  async enterAddPostScene(@Ctx() ctx: CustomContext) {
    await ctx.scene.enter('postScene');
  }

  @Action('add_book')
  async enterAddFileScene(@Ctx() ctx: CustomContext) {
    await ctx.replyWithHTML(
      'Загрузите один или несколько файлов через скрепку',
    );
  }

  @On('document')
  async addFile(@Ctx() ctx: CustomContext) {
    try {
      await this.messageService.handleDocumentMessage(ctx);
      const user = ctx.from;
      const username = user.username || user.first_name;
      await ctx.reply(
        `${username} Что что то еще будем делать?`,
        bottonsForAdmin(),
      );
    } catch (error) {
      console.error('Error handling file upload:', error);
    }
  }

  @Action('stop_auto_post')
  async handleStopAutoPost(@Ctx() ctx: CustomContext) {
    this.postService.stopAutoPost();
    await ctx.replyWithHTML('Автопостинг остановлен.');
    const user = ctx.from;
    const username = user.username || user.first_name;
    await ctx.reply(
      `${username} Что что то еще будем делать?`,
      bottonsForAdmin(),
    );
  }
}
