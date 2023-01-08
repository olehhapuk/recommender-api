import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

import { Video } from '../../videos/entities/video.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  name: string;

  @ManyToMany(() => Video, (video) => video.tags)
  videos: Video[];

  @ManyToMany(() => User, (user) => user.recommendedTags)
  recommendedUsers: User[];
}
