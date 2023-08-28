import { Injectable } from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PublicationsRepository {

  constructor(private readonly prisma: PrismaService) {}

  create(data: CreatePublicationDto) {
    return this.prisma.publications.create({
      data
    });
  }

  findAll() {
    return this.prisma.publications.findMany();
  }

  findOne(id: number) {
    return this.prisma.publications.findFirst({
      where: {
        id
      }
    });
  }

  findOneByPostId(postId: number) {
    return this.prisma.publications.findFirst({
      where: {
        postId
      }
    });
  }

  findOneByMediaId(mediaId: number) {
    return this.prisma.publications.findFirst({
      where: {
        mediaId
      }
    });
  }

  update(id: number, data: CreatePublicationDto) {
    return this.prisma.publications.update({
      data,
      where: {
        id
      }
    });
  }

  remove(id: number) {
    return this.prisma.publications.delete({
      where: {
        id
      }
    });
  }
}