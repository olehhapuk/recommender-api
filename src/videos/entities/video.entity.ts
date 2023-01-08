import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Tag } from '../../tags/entities/tag.entity';

@Entity()
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  description: string;

  @Column()
  videoUrl: string;

  @Column()
  thumbnailUrl: string;

  @Column({
    default: 0,
  })
  views: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.videos)
  author: User;

  @ManyToMany(() => User, (user) => user.likes)
  likedBy: User[];

  @ManyToMany(() => Tag, (tag) => tag.videos)
  @JoinTable()
  tags: Tag[];
}
