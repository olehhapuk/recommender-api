import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Chance } from 'chance';

import { User } from '../users/entities/user.entity';
import { Video } from '../videos/entities/video.entity';
import { Tag } from '../tags/entities/tag.entity';

dotenv.config();
const chance = new Chance();

async function main() {
  try {
    const dataSource = await init();

    await dataSource.synchronize(true);

    const users = await seedUsers(dataSource, 15);
    const tags = await seedTags(dataSource, 15);
    await seedVideos(dataSource, 50, users, tags);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

async function seedUsers(
  dataSource: DataSource,
  count: number,
): Promise<User[]> {
  const usersRepository = dataSource.getRepository<User>(User);
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    const newUser = new User();
    newUser.username = chance.name().toLowerCase().replace(/ /g, '_');
    newUser.email = chance.email();
    newUser.password = chance.word();
    newUser.description = chance.paragraph();
    newUser.avatarUrl = chance.avatar();
    users.push(newUser);
  }

  return await usersRepository.save(users);
}

async function seedTags(dataSource: DataSource, count: number): Promise<Tag[]> {
  const tagsRepository = dataSource.getRepository<Tag>(Tag);
  const tags: Tag[] = [];
  for (let i = 0; i < count; i++) {
    const newTag = new Tag();
    do {
      newTag.name = chance.hashtag().replace('#', '');
    } while (tags.find((tag) => tag.name === newTag.name));
    tags.push(newTag);
  }

  return await tagsRepository.save(tags);
}

async function seedVideos(
  dataSource: DataSource,
  count: number,
  users: User[],
  tags: Tag[],
): Promise<Video[]> {
  const videosRepository = dataSource.getRepository<Video>(Video);
  const videos: Video[] = [];
  for (let i = 0; i < count; i++) {
    const tagsCount = chance.integer({ min: 0, max: 5 });
    const videoTags: Tag[] = [];
    for (let i = 0; i < tagsCount; i++) {
      let tag: Tag;
      do {
        const tagIndex = chance.integer({ min: 0, max: tags.length - 1 });
        tag = tags[tagIndex];
      } while (videoTags.includes(tag));

      videoTags.push(tag);
    }

    const authorIndex = chance.integer({ min: 0, max: users.length - 1 });
    const author: User = users[authorIndex];

    const newVideo = new Video();

    newVideo.description = chance.paragraph();
    newVideo.thumbnailUrl = chance.avatar();
    newVideo.videoUrl =
      'https://jsoncompare.org/LearningContainer/SampleFiles/Video/MP4/Sample-Video-File-For-Testing.mp4';
    newVideo.views = chance.integer({ min: 0, max: 1000000 });
    newVideo.tags = videoTags;
    newVideo.author = author;

    videos.push(newVideo);
  }

  return await videosRepository.save(videos);
}

async function init(): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DB_URL,
    entities: [User, Video, Tag],
    synchronize: false,
  });

  const connection = await dataSource.initialize();
  await dataSource.synchronize(true);

  return connection;
}

main();
