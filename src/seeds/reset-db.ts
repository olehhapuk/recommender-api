import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

import { User } from '../users/entities/user.entity';
import { Video } from '../videos/entities/video.entity';
import { Tag } from '../tags/entities/tag.entity';

dotenv.config();

async function main() {
  try {
    const dataSource = await init();

    await dataSource.synchronize(true);

    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
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
