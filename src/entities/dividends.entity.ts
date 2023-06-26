import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'dividends' })
export class Dividends {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['DIVIDENDS', 'JRC'] })
  type: string;

  @Column({ type: 'date' })
  payment_date: Date;

  @Column()
  ticket: string;

  @Column({ type: 'decimal', precision: 19, scale: 4 })
  rate: number;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'decimal', precision: 19, scale: 2 })
  total: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
