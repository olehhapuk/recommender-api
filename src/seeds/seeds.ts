import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Chance } from 'chance';

import { User } from '../users/entities/user.entity';
import { Video } from '../videos/entities/video.entity';
import { Tag } from '../tags/entities/tag.entity';

dotenv.config();
const chance = new Chance();

async function main() {
  const dataSource = await init();

  await dataSource.synchronize(true);

  const users = await seedUsers(dataSource, 15);
  const tags = await seedTags(dataSource, 15);
  await seedVideos(dataSource, 50, users, tags);
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
    newTag.name = chance.hashtag().replace('#', '');
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
    const videoTags: Tag[] = Array.of(null)
      .fill(null, 0, tagsCount)
      .map(() => {
        const tagIndex = chance.integer({ min: 0, max: tags.length - 1 });
        const tag = tags[tagIndex];
        return tag;
      });

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
  });

  return await dataSource.initialize();
}

main();
