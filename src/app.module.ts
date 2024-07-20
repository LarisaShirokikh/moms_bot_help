import { Module } from '@nestjs/common';
import { AppUpdate } from './app.update';
import { AppService } from './services/app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import * as LocalSession from 'telegraf-session-local';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './Schemas/file.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Subject } from './Schemas/subject.entity';
import { Class } from './Schemas/class.entity';
import { Photo } from './Schemas/photo.entity';
import { PostService } from './services/post.service';
import { MessageService } from './services/message.service';
import * as dotenv from 'dotenv';
import { AdminScene } from './scene/admin.scene';
import { SearchBookScene } from './scene/searchBook.scene';
import { UserScene } from './scene/user.scene';
import { Post } from './Schemas/post.entity';
import { PostScene } from './scene/post.scene';
import { Subscription } from './Schemas/subscription.entity';
import { SubscriptionService } from './services/subscription.service';
dotenv.config();

const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
    TypeOrmModule.forFeature([File, Subject, Class, Photo, Post, Subscription]),
    TelegrafModule.forRoot({
      middlewares: [sessions.middleware()],
      token: process.env.BOT_TOKEN,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        synchronize: true,
        entities: [__dirname + '/**/*.entity{.js, .ts}'],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    PostScene,
    SearchBookScene,
    AdminScene,
    UserScene,
    AppService,
    AppUpdate,
    PostService,
    MessageService,
    SubscriptionService,
  ],
})
export class AppModule {}
