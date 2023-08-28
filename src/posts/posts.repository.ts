import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostsRepository {
  
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreatePostDto) {
    return this.prisma.posts.create({
      data
    });
  }

  findAll() {
    return this.prisma.posts.findMany();
  }

  findOne(id: number) {
    return this.prisma.posts.findFirst({
      where: {
        id
      }
    });
  }

  update(id: number, data: CreatePostDto) {
    return this.prisma.posts.update({
      data,
      where: {
        id
      }
    });
  }

  remove(id: number) {
    return this.prisma.posts.delete({
      where: {
        id
      }
    });
  }
}
