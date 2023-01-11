import { ApiProperty } from '@nestjs/swagger/dist';

export class CreateTagDto {
  @ApiProperty()
  name: string;
}
