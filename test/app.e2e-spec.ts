import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpStatus } from '@nestjs/common/enums';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, PrismaModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prisma = app.get(PrismaService);

    await prisma.publications.deleteMany();
    await prisma.medias.deleteMany();
    await prisma.posts.deleteMany();

    await app.init();
  });

  it('/health => should get an alive message', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect('I’m okay!');
  });

  it('/medias (POST) => should return an error 400 when media body is wrong', async() => {
    const response = await request(app.getHttpServer())
      .post('/medias')
      .send({
        title: "test"
      })
      .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message[0]).toBe("username should not be empty");
  })

  it('/medias (POST) => should deny a new media with the same combination of title and username', async() => {
    const media = await prisma.medias.create({
      data: {
        title: "test",
        username: "test"
      }
    });

    const response = await request(app.getHttpServer())
      .post('/medias')
      .send({
        title: "test",
        username: "test"
      })
      .expect(HttpStatus.CONFLICT);

    expect(response.body.message).toBe("This title is already being used by this user!")
  })

  it("/medias (POST) => should create a new media", async() => {
    const response = await request(app.getHttpServer())
      .post('/medias')
      .send({
        title: "test",
        username: "test"
      })
      .expect(HttpStatus.CREATED);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        title: expect.any(String),
        username: expect.any(String),
    }))
  })

  it("/medias (GET) => should respond with empty array", async() => {
    return request(app.getHttpServer())
      .get('/medias')
      .expect(HttpStatus.OK)
      .expect([]);
  })

  it("/medias (GET) => should respond with medias", async() => {
    for(let i=0;i<10;i++) {
      await prisma.medias.create({
        data: {
          title: `test${i}`,
          username: `test${i}`
        }
      })
    }

    const response = await request(app.getHttpServer())
      .get('/medias')
      .expect(HttpStatus.OK)

    expect(response.body).toHaveLength(10);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          title: expect.any(String),
          username: expect.any(String),
        })
      ])
    )
  })

  it(`/medias/:id (GET) => should return an error 404 when the id does not 
  correspond to a media record.`, async() => {
    const response = await request(app.getHttpServer())
      .get('/medias/1')
      .expect(HttpStatus.NOT_FOUND)
    
    expect(response.body.message).toBe('There is no matching record with this id');
  })

  it("medias/:id (GET) => should return the media with the designated id", async() => {
    const media = await prisma.medias.create({
      data: {
        title: "test",
        username: "test"
      }
    });

    const response = await request(app.getHttpServer())
      .get(`/medias/${media.id}`)
      .expect(HttpStatus.OK)
    
    expect(response.body).toEqual(
      expect.objectContaining({
        id: media.id,
        title: "test",
        username: "test"
      })
    )
  })

  it('/medias/:id (UPDATE) => should return an error 400 when media body is wrong', async() => {
    const media = await prisma.medias.create({
      data: {
        title: "test",
        username: "test"
      }
    });
    
    const response = await request(app.getHttpServer())
      .patch(`/medias/${media.id}`)
      .send({
        title: "test"
      })
      .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message[0]).toBe("username should not be empty");
  })

  it(`/medias/:id (UPDATE) => should return an error 404 when the id does not 
  correspond to a media record.`, async() => {
    const response = await request(app.getHttpServer())
      .patch('/medias/1')
      .send({
        title: "test", 
        username: "test"
      })
      .expect(HttpStatus.NOT_FOUND)
    
    expect(response.body.message).toBe('There is no matching record with this id');
  })

  it('/medias/:id (UPDATE) => should update the designated media', async() => {
    const media = await prisma.medias.create({
      data: {
        title: "test1",
        username: "test1"
      }
    });

    const response = await request(app.getHttpServer())
      .patch(`/medias/${media.id}`)
      .send({
        title: "test2", 
        username: "test2"
      })
      .expect(HttpStatus.OK);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: media.id,
        title: "test2",
        username: "test2"
      })
    );
  })

  it(`/medias/:id (DELETE) => should return an error 404 when the id does not correspond to a media record.`, async() => {
    const response = await request(app.getHttpServer())
      .delete('/medias/1')
      .expect(HttpStatus.NOT_FOUND)
    
    expect(response.body.message).toBe('There is no matching record with this id');
  })

  it('/medias/:id (DELETE) => should return an error 403 when media is associated with at least one publication', async() => {
    const media = await prisma.medias.create({
      data: {
        title: "test",
        username: "test"
      }
    });

    const post = await prisma.posts.create({
      data: {
        title: "test",
        text: "test"
      }
    });

    await prisma.publications.create({
      data: {
        mediaId: media.id,
        postId: post.id,
        date: "2023-08-21T13:25:17.352Z"
      }
    });

    const response = await request(app.getHttpServer())
      .delete(`/medias/${media.id}`)
      .expect(HttpStatus.FORBIDDEN);

      expect(response.body.message).toBe("This media is already associated with a publication, it can't be deleted!");
  })

  it('/medias/:id (DELETE) => should delete the designated media', async() => {
    const media = await prisma.medias.create({
      data: {
        title: "test1",
        username: "test1"
      }
    });

    await request(app.getHttpServer())
      .delete(`/medias/${media.id}`)
      .expect(HttpStatus.OK);
  })

  it('/posts (POST) => should return an error 400 when post body is wrong', async() => {
    const response = await request(app.getHttpServer())
      .post('/posts')
      .send({
        title: "test"
      })
      .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message[0]).toBe("text should not be empty");
  })

  it("/posts (POST) => should create a new post", async() => {
    const response = await request(app.getHttpServer())
      .post('/posts')
      .send({
        title: "test",
        text: "test"
      })
      .expect(HttpStatus.CREATED);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        title: expect.any(String),
        text: expect.any(String),
    }))
  })

  it("/posts (GET) => should respond with empty array", async() => {
    return request(app.getHttpServer())
      .get('/posts')
      .expect(HttpStatus.OK)
      .expect([]);
  })

  it("/posts (GET) => should respond with posts", async() => {
    for(let i=0;i<10;i++) {
      await prisma.posts.create({
        data: {
          title: `test${i}`,
          text: `test${i}`
        }
      })
    }

    const response = await request(app.getHttpServer())
      .get('/posts')
      .expect(HttpStatus.OK)

    expect(response.body).toHaveLength(10);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          title: expect.any(String),
          text: expect.any(String),
        })
      ])
    )
  })

  it(`/posts/:id (GET) => should return an error 404 when the id does not 
  correspond to a post record.`, async() => {
    const response = await request(app.getHttpServer())
      .get('/posts/1')
      .expect(HttpStatus.NOT_FOUND)
    
    expect(response.body.message).toBe('There is no matching record with this id');
  })

  it("posts/:id (GET) => should return the media with the designated id", async() => {
    const post = await prisma.posts.create({
      data: {
        title: "test",
        text: "test"
      }
    });

    const response = await request(app.getHttpServer())
      .get(`/posts/${post.id}`)
      .expect(HttpStatus.OK)
    
    expect(response.body).toEqual(
      expect.objectContaining({
        id: post.id,
        title: "test",
        text: "test"
      })
    )
  })

  it('/posts/:id (UPDATE) => should return an error 400 when post body is wrong', async() => {
    const post = await prisma.posts.create({
      data: {
        title: "test",
        text: "test"
      }
    });
    
    const response = await request(app.getHttpServer())
      .patch(`/posts/${post.id}`)
      .send({
        title: "test"
      })
      .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message[0]).toBe("text should not be empty");
  })

  it(`/posts/:id (UPDATE) => should return an error 404 when the id does not 
  correspond to a post record.`, async() => {
    const response = await request(app.getHttpServer())
      .patch('/posts/1')
      .send({
        title: "test", 
        text: "test"
      })
      .expect(HttpStatus.NOT_FOUND)
    
    expect(response.body.message).toBe('There is no matching record with this id');
  })

  it('/posts/:id (UPDATE) => should update the designated post', async() => {
    const post = await prisma.posts.create({
      data: {
        title: "test1",
        text: "test1"
      }
    });

    const response = await request(app.getHttpServer())
      .patch(`/posts/${post.id}`)
      .send({
        title: "test2", 
        text: "test2"
      })
      .expect(HttpStatus.OK);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: post.id,
        title: "test2",
        text: "test2"
      })
    );
  })

  it(`/posts/:id (DELETE) => should return an error 404 when the id does not correspond to a post record.`, async() => {
    const response = await request(app.getHttpServer())
      .delete('/posts/1')
      .expect(HttpStatus.NOT_FOUND)
    
    expect(response.body.message).toBe('There is no matching record with this id');
  })

  it('/posts/:id (DELETE) => should return an error 403 when post is associated with at least one publication', async() => {
    const media = await prisma.medias.create({
      data: {
        title: "test",
        username: "test"
      }
    });

    const post = await prisma.posts.create({
      data: {
        title: "test",
        text: "test"
      }
    });

    await prisma.publications.create({
      data: {
        mediaId: media.id,
        postId: post.id,
        date: "2023-08-21T13:25:17.352Z"
      }
    });

    const response = await request(app.getHttpServer())
      .delete(`/posts/${post.id}`)
      .expect(HttpStatus.FORBIDDEN);

      expect(response.body.message).toBe("This post is already associated with a publication, it can't be deleted!");
  })

  it('/posts/:id (DELETE) => should delete the designated post', async() => {
    const post = await prisma.posts.create({
      data: {
        title: "test1",
        text: "test1"
      }
    });

    await request(app.getHttpServer())
      .delete(`/posts/${post.id}`)
      .expect(HttpStatus.OK);
  })

  it('/publications (POST) => should return an error 400 when publication body is wrong', async() => {
    const response = await request(app.getHttpServer())
      .post('/publications')
      .send({
        mediaId: 1,
        postId: 1
      })
      .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message[0]).toBe("date should not be empty");
  })

  it('/publications (POST) => should return an error 404 when mediaId is not associated with an actual media', async() => {
    const response = await request(app.getHttpServer())
      .post('/publications')
      .send({
        mediaId: 1,
        postId: 1,
        date: "2023-08-21T13:25:17.352Z"
      })
      .expect(HttpStatus.NOT_FOUND);

    expect(response.body.message).toBe("There is no matching media with this id")
  })

  it('/publications (POST) => should return an error 404 when postId is not associated with an actual post', async() => {
    const media = await prisma.medias.create({
      data: {
        title: 'test',
        username: 'test'
      }
    })

    const response = await request(app.getHttpServer())
      .post('/publications')
      .send({
        mediaId: media.id,
        postId: 1,
        date: "2023-08-21T13:25:17.352Z"
      })
      .expect(HttpStatus.NOT_FOUND);

    expect(response.body.message).toBe("There is no matching post with this id")
  })

  it("/publications (POST) => should create a new publication", async() => {
    const media = await prisma.medias.create({
      data: {
        title: "test",
        username: "test"
      }
    });

    const post = await prisma.posts.create({
      data: {
        title: "test",
        text: "test"
      }
    });

    const response = await request(app.getHttpServer())
      .post('/publications')
      .send({
        mediaId: media.id,
        postId: post.id,
        date: "2023-08-21T13:25:17.352Z"
      })
      .expect(HttpStatus.CREATED);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        mediaId: media.id,
        postId: post.id,
        date: "2023-08-21T13:25:17.352Z"
    }))
  })

  it("/publications (GET) => should respond with empty array", async() => {
    return request(app.getHttpServer())
      .get('/publications')
      .expect(HttpStatus.OK)
      .expect([]);
  })

  it("/publications (GET) => should respond with publications", async() => {
    for (let i=0;i<10;i++) {
      const media = await prisma.medias.create({
        data: {
          title: `test${i}`,
          username: `test${i}`,
        }
      });

      const post = await prisma.posts.create({
        data: {
          title: `test${i}`,
          text: `test${i}`,
        }
      });

      const publication = await prisma.publications.create({
        data: {
          mediaId: media.id,
          postId: post.id,
          date: "2023-08-21T13:25:17.352Z"
        }
      })
    }

    const response = await request(app.getHttpServer())
      .get('/publications')
      .expect(HttpStatus.OK)

    expect(response.body).toHaveLength(10);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          mediaId: expect.any(Number),
          postId: expect.any(Number),
          date: expect.any(String),
        })
      ])
    )
  })

  it(`/publications/:id (GET) => should return an error 404 when the id does not 
  correspond to a publication record.`, async() => {
    const response = await request(app.getHttpServer())
      .get('/publications/1')
      .expect(HttpStatus.NOT_FOUND)
    
    expect(response.body.message).toBe('There is no matching record with this id');
  })

  it("publications/:id (GET) => should return the publication with the designated id", async() => {
    const media = await prisma.medias.create({
      data: {
        title: "test",
        username: "test"
      }
    });

    const post = await prisma.posts.create({
      data: {
        title: "test",
        text: "test"
      }
    });

    const publication = await prisma.publications.create({
      data: {
        mediaId: media.id,
        postId: post.id,
        date: "2023-08-21T13:25:17.352Z"
      }
    })

    const response = await request(app.getHttpServer())
      .get(`/publications/${publication.id}`)
      .expect(HttpStatus.OK)
    
    expect(response.body).toEqual(
      expect.objectContaining({
        id: publication.id,
        mediaId: media.id,
        postId: post.id,
        date: "2023-08-21T13:25:17.352Z"
      })
    )
  })

  it('/publications/:id (UPDATE) => should return an error 400 when publication body is wrong', async() => {
    const media = await prisma.medias.create({
      data: {
        title: "test",
        username: "test"
      }
    });

    const post = await prisma.posts.create({
      data: {
        title: "test",
        text: "test"
      }
    });

    const publication = await prisma.publications.create({
      data: {
        mediaId: media.id,
        postId: post.id,
        date: "2023-08-21T13:25:17.352Z"
      }
    })
    
    const response = await request(app.getHttpServer())
      .patch(`/publications/${publication.id}`)
      .send({
        mediaId: media.id,
        postId: post.id,
      })
      .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message[0]).toBe("date should not be empty");
  })

  it(`/publication/:id (UPDATE) => should return an error 404 when the id does not 
  correspond to a publication record.`, async() => {
    const response = await request(app.getHttpServer())
      .patch('/publications/1')
      .send({
        mediaId: 1,
        postId: 1,
        date: "2023-08-21T13:25:17.352Z"
      })
      .expect(HttpStatus.NOT_FOUND)
    
    expect(response.body.message).toBe('There is no matching record with this id');
  })

  it('/publications/:id (UPDATE) => should update the designated publication', async() => {
    const media = await prisma.medias.create({
      data: {
        title: "test",
        username: "test"
      }
    });

    const post = await prisma.posts.create({
      data: {
        title: "test",
        text: "test"
      }
    });

    const publication = await prisma.publications.create({
      data: {
        mediaId: media.id,
        postId: post.id,
        date: "2023-08-30T13:25:17.352Z"
      }
    });

    const response = await request(app.getHttpServer())
      .patch(`/publications/${publication.id}`)
      .send({
        mediaId: media.id,
        postId: post.id,
        date: "2023-09-15T13:25:17.352Z"
      })
      .expect(HttpStatus.OK);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: publication.id,
        mediaId: media.id,
        postId: post.id,
        date: "2023-09-15T13:25:17.352Z"
      })
    );
  })

  it(`/publications/:id (DELETE) => should return an error 404 when the id does not correspond to a publication record.`, async() => {
    const response = await request(app.getHttpServer())
      .delete('/publications/1')
      .expect(HttpStatus.NOT_FOUND)
    
    expect(response.body.message).toBe('There is no matching record with this id');
  })

  it('/publications/:id (DELETE) => should delete the designated publication', async() => {
    const media = await prisma.medias.create({
      data: {
        title: "test",
        username: "test"
      }
    });

    const post = await prisma.posts.create({
      data: {
        title: "test",
        text: "test"
      }
    });

    const publication = await prisma.publications.create({
      data: {
        mediaId: media.id,
        postId: post.id,
        date: "2023-08-30T13:25:17.352Z"
      }
    });

    await request(app.getHttpServer())
      .delete(`/publications/${publication.id}`)
      .expect(HttpStatus.OK);
  })

});
