import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediasModule } from './medias/medias/medias.module';
import { MediasModule } from './medias/medias.module';
import { MediasModule } from './medias/medias/medias.module';

@Module({
  imports: [MediasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
