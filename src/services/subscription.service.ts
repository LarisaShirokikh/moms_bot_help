import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from 'src/Schemas/subscription.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async isSubscribed(userId: number, channelId: string): Promise<boolean> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId, channelId },
    });
    return !!subscription;
  }

  async createSubscription(
    userId: number,
    channelId: string,
  ): Promise<Subscription> {
    const subscribedAt = new Date();
    const expiresAt = new Date(subscribedAt);
    expiresAt.setMonth(expiresAt.getMonth() + 1); // Добавляем один месяц

    const subscription = this.subscriptionRepository.create({
      userId,
      channelId,
      subscribedAt,
      expiresAt,
    });
    return this.subscriptionRepository.save(subscription);
  }

  async getSubscriptionInviteLink(): Promise<string> {
    // Замените на вашу реальную ссылку приглашения
    return 'https://t.me/joinchat/YOUR_CHANNEL_INVITE_LINK';
  }
}
