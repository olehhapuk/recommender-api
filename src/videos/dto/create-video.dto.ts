import { ApiProperty } from '@nestjs/swagger/dist';

export class CreateVideoDto {
  @ApiProperty()
  description: string;

  @ApiProperty()
  videoUrl: string;

  @ApiProperty()
  thumbnailUrl: string;

  @ApiProperty()
  tags: string[];
}
