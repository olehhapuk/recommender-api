import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository, In } from 'typeorm';

import { Video } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { User } from '../users/entities/user.entity';
import { Tag } from '../tags/entities/tag.entity';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly videosRepository: Repository<Video>,
  ) {}

  private defaultRelations: FindOptionsRelations<Video> = {
    author: true,
    likedBy: true,
    tags: true,
  };

  async create(data: CreateVideoDto, user: User, tags: Tag[]): Promise<Video> {
    const video = await this.videosRepository.save({
      description: data.description,
      videoUrl: data.videoUrl,
      thumbnailUrl: data.thumbnailUrl,
      author: user,
      tags,
    });

    return this.findOne(video.id);
  }

  async findByAuthor(authorId: number): Promise<Video[]> {
    return this.videosRepository.find({
      where: {
        author: {
          id: authorId,
        },
      },
      relations: this.defaultRelations,
    });
  }

  async getFeed(user: User): Promise<Video[]> {
    const videos = await this.videosRepository.find({
      where: {
        author: In(user.following.map(({ id }) => id)),
      },
      relations: this.defaultRelations,
    });

    return videos;
  }

  async getRecommendations(user: User): Promise<Video[]> {
    const tagIds = user.recommendedTags.map(({ id }) => id);

    if (tagIds.length > 0) {
      const videos = await this.videosRepository
        .createQueryBuilder('video')
        .leftJoinAndSelect('video.tags', 'tags')
        .leftJoinAndSelect('video.author', 'author')
        .leftJoinAndSelect('video.likedBy', 'likedBy')
        .where(`tags.id IN (${tagIds.join(',')})`);

      console.log(videos.getSql());

      return videos.getMany();
    } else {
      return this.getPopular();
    }
  }

  async getPopular(): Promise<Video[]> {
    return this.videosRepository.find({
      order: {
        views: 'DESC',
      },
      relations: this.defaultRelations,
    });
  }

  async recordView(video: Video): Promise<Video> {
    video.views++;
    await this.videosRepository.save(video);
    return this.findOne(video.id);
  }

  async findOne(id: number): Promise<Video> {
    return this.videosRepository.findOne({
      where: { id },
      relations: this.defaultRelations,
    });
  }

  async like(video: Video, user: User): Promise<Video> {
    video.likedBy.push(user);
    await this.videosRepository.save(video);
    return this.findOne(video.id);
  }

  async unlike(video: Video, user: User): Promise<Video> {
    video.likedBy = video.likedBy.filter(
      (userLiked) => userLiked.id !== user.id,
    );
    await this.videosRepository.save(video);
    return this.findOne(video.id);
  }

  async checkLike(video: Video, user: User): Promise<boolean> {
    return !!video.likedBy.find((userLiked) => userLiked.id === user.id);
  }
}
