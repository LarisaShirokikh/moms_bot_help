// file.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Subject } from './subject.entity';
import { Class } from './class.entity';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileId: string;

  @Column()
  fileName: string;

  @Column()
  fileLink: string;

  @Column({ default: false })
  public?: boolean;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Subject, (subject) => subject.files)
  @JoinTable()
  subjects: Subject[];

  @ManyToMany(() => Class, (cls) => cls.files)
  @JoinTable()
  classes: Class[];
}
