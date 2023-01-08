import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private readonly tagsRepository: Repository<Tag>,
  ) {}

  async getAll(): Promise<Tag[]> {
    return this.tagsRepository.find();
  }

  async getOne(id: number): Promise<Tag | null> {
    return this.tagsRepository.findOneBy({
      id,
    });
  }

  async getByName(name: string): Promise<Tag[]> {
    const tags = await this.tagsRepository.find({
      where: {
        name: Like(`%${name.toLowerCase()}%`),
      },
    });

    return tags;
  }

  async create(name: string): Promise<Tag> {
    const tag = await this.tagsRepository.save({
      name: name.toLowerCase(),
    });

    return tag;
  }

  async findOrCreate(data: string[]): Promise<Tag[]> {
    const tags = [];

    for (const tagName of data) {
      const tag = await this.findByName(tagName);
      if (tag) {
        tags.push(tag);
      } else {
        const newTag = await this.create(tagName);
        tags.push(newTag);
      }
    }

    return tags;
  }

  async findByName(name: string): Promise<Tag> {
    return this.tagsRepository.findOneBy({
      name,
    });
  }
}
