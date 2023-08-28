import { Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediasRepository } from './medias.repository';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common/exceptions';
import { PublicationsRepository } from '../publications/publications.repository';

@Injectable()
export class MediasService {

  constructor(private readonly repository: MediasRepository, private readonly publications: PublicationsRepository) {}

  async create(createMediaDto: CreateMediaDto) {
    const sameCombination = await this.repository.findMediaByTitleAndUsername(createMediaDto.title, createMediaDto.username);
    if (sameCombination) throw new ConflictException("This title is already being used by this user!");

    return await this.repository.create(createMediaDto);
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findOne(id: number) {
    const media = await this.repository.findOne(id);
    if (!media) throw new NotFoundException("There is no matching record with this id");

    return media;
  }

  async update(id: number, updateMediaDto: CreateMediaDto) {
    const isMedia = await this.repository.findOne(id);
    if (!isMedia) throw new NotFoundException("There is no matching record with this id");

    const sameCombination = await this.repository.findMediaByTitleAndUsername(updateMediaDto.title, updateMediaDto.username);
    if (sameCombination) throw new ConflictException("Title is already being used by this user!");

    return await this.repository.update(id, updateMediaDto);
  }

  async remove(id: number) {
    const isMedia = await this.repository.findOne(id);
    if (!isMedia) throw new NotFoundException("There is no matching record with this id");

    const publication = await this.publications.findOneByMediaId(id);
    if (publication) throw new ForbiddenException("This media is already associated with a publication, it can't be deleted!");

    return await this.repository.remove(id);
  }
}
