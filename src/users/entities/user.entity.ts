import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { Video } from '../../videos/entities/video.entity';
import { Tag } from '../../tags/entities/tag.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  username: string;

  @Column()
  password: string;

  @Column({
    nullable: true,
  })
  avatarUrl: string;

  @Column({
    default: '',
  })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Video, (video) => video.author)
  videos: Video[];

  @ManyToMany(() => Video, (video) => video.likedBy)
  @JoinTable()
  likes: Video[];

  @ManyToMany(() => User, (user) => user.following)
  @JoinTable()
  followers: User[];

  @ManyToMany(() => User, (user) => user.followers)
  following: User[];

  @ManyToMany(() => Tag, (tag) => tag.recommendedUsers)
  @JoinTable()
  recommendedTags: Tag[];
}
