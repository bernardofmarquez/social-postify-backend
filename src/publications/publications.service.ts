import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { PublicationsRepository } from './publications.repository';
import { PostsRepository } from 'src/posts/posts.repository';
import { MediasRepository } from 'src/medias/medias.repository';

@Injectable()
export class PublicationsService {

  constructor(private readonly repository: PublicationsRepository, private readonly posts: PostsRepository,
    private readonly medias: MediasRepository) {}

  async create(createPublicationDto: CreatePublicationDto) {
    const media = await this.medias.findOne(createPublicationDto.mediaId);
    if (!media) throw new NotFoundException("There is no matching media with this id");

    const post = await this.posts.findOne(createPublicationDto.postId);
    if (!post) throw new NotFoundException("There is no matching post with this id");

    return await this.repository.create(createPublicationDto);
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findOne(id: number) {
    const publication = await this.repository.findOne(id);
    if (!publication) throw new NotFoundException("There is no matching record with this id");

    return publication;
  }

  async update(id: number, updatePublicationDto: CreatePublicationDto) {
    const publication = await this.repository.findOne(id);
    if (!publication) throw new NotFoundException("There is no matching record with this id");

    const dateNow = new Date();
    if (dateNow > publication.date) throw new ForbiddenException("This publication has already been submitted!")

    const media = await this.medias.findOne(updatePublicationDto.mediaId);
    if (!media) throw new NotFoundException("There is no matching media with this id");

    const post = await this.posts.findOne(updatePublicationDto.postId);
    if (!post) throw new NotFoundException("There is no matching post with this id");

    return await this.repository.update(id, updatePublicationDto);
  }

  async remove(id: number) {
    const isPublication = await this.repository.findOne(id);
    if (!isPublication) throw new NotFoundException("There is no matching record with this id");

    return await this.repository.remove(id);
  }
}
