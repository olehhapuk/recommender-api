import { Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  static readonly FolderName = 'recommender';

  async uploadVideo(file: Express.Multer.File) {
    console.log(file);
    return await v2.uploader.upload(file.path, {
      folder: CloudinaryService.FolderName,
      resource_type: 'video',
    });
  }

  async uploadImage(file: Express.Multer.File) {
    return await v2.uploader.upload(file.path, {
      folder: CloudinaryService.FolderName,
    });
  }
}
