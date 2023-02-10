import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { VideosModule } from './videos/videos.module';
import { Video } from './videos/entities/video.entity';
import { VideosService } from './videos/videos.service';
import { Tag } from './tags/entities/tag.entity';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      synchronize: true,
      entities: [User, Video, Tag],
    }),
    TypeOrmModule.forFeature([Video]),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '../', 'public'),
    }),
    UsersModule,
    AuthModule,
    VideosModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService, VideosService],
})
export class AppModule {}
