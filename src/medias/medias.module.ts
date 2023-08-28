import { Module } from '@nestjs/common';
import { MediasService } from './medias.service';
import { MediasController } from './medias.controller';
import { MediasRepository } from './medias.repository';

@Module({
  controllers: [MediasController],
  providers: [MediasService, MediasRepository],
})
export class MediasModule {}
