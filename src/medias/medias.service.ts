import { Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediasRepository } from './medias.repository';
import { ConflictException, NotFoundException } from '@nestjs/common/exceptions';

@Injectable()
export class MediasService {

  constructor(private readonly repository: MediasRepository) {}

  async create(createMediaDto: CreateMediaDto) {
    const sameCombination = await this.repository.findMediaByTitleAndUsername(createMediaDto.title, createMediaDto.username);
    if (sameCombination) throw new ConflictException("Title is already being used by this user!");

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

    return await this.repository.remove(id);
  }
}
