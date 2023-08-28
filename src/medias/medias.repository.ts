import { Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MediasRepository {

  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateMediaDto) {
    return this.prisma.medias.create({
      data
    })
  }

  findMediaByTitleAndUsername(title: string, username: string) {
    return this.prisma.medias.findFirst({
      where: {
        username,
        title
      }
    });
  }
  
  findAll() {
    return this.prisma.medias.findMany();
  }

  findOne(id: number) {
    return this.prisma.medias.findFirst({
      where: {
        id
      }
    })
  }

  update(id: number, data: CreateMediaDto) {
    return this.prisma.medias.update({
      data,
      where: {
        id
      }
    })
  }

  remove(id: number) {
    return this.prisma.medias.delete({
      where: {
        id
      }
    })
  }
}