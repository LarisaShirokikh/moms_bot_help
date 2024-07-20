import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileId: string;

  @Column()
  fileName: string;

  @Column()
  fileLink: string;

  @Column('timestamp')
  scheduledDate: Date;

  @Column('text')
  postText: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
