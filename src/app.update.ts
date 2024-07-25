import { Telegraf } from 'telegraf';
import { Action, Ctx, InjectBot, Start, Update } from 'nestjs-telegraf';
import { CustomContext } from './context/context';

@Update()
export class AppUpdate {
  constructor(@InjectBot() private readonly bot: Telegraf<CustomContext>) {}

  @Start()
  async start(@Ctx() ctx: CustomContext) {
    try {
      const user = ctx.from;
      const userId = user.id
      const isAdmin = userId === 5784446985;

      console.log(`User ID: ${userId}`); // Лог для проверки User ID
      console.log(`Is Admin: ${isAdmin}`);

      if(isAdmin) {
          await ctx.scene.enter('adminScene');
      } else {
        await ctx.scene.enter('userScene');
       
      }
    } catch (error) {
      console.error('Error in startCommand:', error);
      await ctx.reply('Произошла ошибка при обработке вашего запроса.');
    }
  }


}
