import { Module, forwardRef } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';
import { PublicationsRepository } from './publications.repository';
import { PostsModule } from 'src/posts/posts.module';
import { MediasModule } from 'src/medias/medias.module';

@Module({
  imports: [forwardRef(() =>PostsModule), forwardRef(() =>MediasModule)],
  controllers: [PublicationsController],
  providers: [PublicationsService, PublicationsRepository],
  exports: [PublicationsRepository],
})
export class PublicationsModule {}
