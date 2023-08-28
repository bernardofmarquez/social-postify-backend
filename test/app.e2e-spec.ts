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

  it('/media (POST) => should return an error 400 when media body is wrong', async() => {
    const response = await request(app.getHttpServer())
      .post('/medias')
      .send({
        title: "test"
      })
      .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message[0]).toBe("username should not be empty");
  })

  it('/media (POST) => should deny a new media with the same combination of title and username', async() => {
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

  it("/media (POST) => should create a new media", async() => {
    const response = await request(app.getHttpServer())
      .post('/medias')
      .send({
        title: "test",
        username: "test"
      })
      .expect(HttpStatus.CREATED);

    const title: string = response.body.title;
    expect(title).toBe("test");
    const username: string = response.body.username;
    expect(username).toBe("test");
  })

  it("/media (GET) => should respond with empty array", async() => {
    return request(app.getHttpServer())
      .get('/medias')
      .expect(HttpStatus.OK)
      .expect([]);
  })

  it("/media (GET) => should respond with medias", async() => {
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

  it('/media (UPDATE) => should return an error 400 when media body is wrong', async() => {
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

  it(`/medias/:id (DELETE) => should return an error 404 when the id does not 
  correspond to a media record.`, async() => {
    const response = await request(app.getHttpServer())
      .delete('/medias/1')
      .expect(HttpStatus.NOT_FOUND)
    
    expect(response.body.message).toBe('There is no matching record with this id');
  })
});
