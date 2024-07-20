import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileId: string;

  @Column()
  fileLink: string;

  @Column()
  caption: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  timePost: Date;
}
