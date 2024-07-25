import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Like, Repository } from 'typeorm';
import { File } from '../Schemas/file.entity';
import { Subject } from '../Schemas/subject.entity';
import { Class } from '../Schemas/class.entity';
import { Photo } from '../Schemas/photo.entity';
import { Post } from 'src/Schemas/post.entity';
import axios from 'axios';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async getAllSubjects(): Promise<Subject[]> {
    return this.subjectRepository.find();
  }

  async createSubject(name: string): Promise<Subject> {
    const newSubject = this.subjectRepository.create({ name });
    return this.subjectRepository.save(newSubject);
  }

  async getClassesBySubject(subjectId: number): Promise<Class[]> {
    const options: FindManyOptions<Class> = {
      where: {
        subjects: {
          id: subjectId,
        },
      },
    };
    return this.classRepository.find(options);
  }

  async getAllClasses(): Promise<Class[]> {
    return this.classRepository.find();
  }

  async createClass(name: string): Promise<Class> {
    const newClass = this.classRepository.create({ name });
    return this.classRepository.save(newClass);
  }

  async saveFile(
    fileId: string,
    fileName: string,
    fileLink: string,
  ): Promise<File> {
    const file = this.fileRepository.create({ fileId, fileName, fileLink });

    return this.fileRepository.save(file);
  }

  async getNextFileToPost(): Promise<File | undefined> {
    return this.fileRepository.findOne({
      where: { public: false }, // Выбираем файлы, которые еще не опубликованы
      order: { createdAt: 'ASC' }, // Берем первый по дате создания
    });
  }

  async getNextFileToId(fileId: string): Promise<File | undefined> {
    return await this.fileRepository.findOne({
      where: { fileId: fileId },
    });
  }

  async markFileAsPosted(fileId: number): Promise<void> {
    await this.fileRepository.update({ id: fileId }, { public: true });
  }

  async findBookByTextSearch(
    searchText: string,
  ): Promise<{ fileName: string; fileLink: string; fileId: string }[]> {
    const foundBooks = await this.fileRepository.find({
      where: {
        fileName: Like(`%${searchText}%`), // Или другой критерий поиска в вашей сущности учебника
      },
    });

    // Преобразуем результаты в нужный формат
    const formattedResults = foundBooks.map((book) => ({
      fileName: book.fileName,
      fileLink: book.fileLink,
      fileId: book.fileId,
    }));

    return formattedResults;
  }

  async savePhoto(
    fileId: string,
    fileLink: string,
    caption: string,
    timePost: Date,
  ): Promise<Photo> {
    const photo = this.photoRepository.create({
      fileId,
      fileLink,
      caption,
      timePost,
    });
    return await this.photoRepository.save(photo);
  }

  async saveScheduledPost(postData: {
    fileId: string;
    fileName: string;
    fileLink: string;
    scheduledDate: Date;
    postText: string;
  }) {
    const newPost = this.postRepository.create(postData);
    await this.postRepository.save(newPost);
  }

 
}
