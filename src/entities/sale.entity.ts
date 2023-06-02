import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Purchase } from './purchase.entity';

@Entity({ name: 'sale' })
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Purchase, { onDelete: 'CASCADE' })
  purchase_id: Purchase;

  @Column({ type: 'date' })
  operation_date: Date;

  @Column()
  ticket: string;

  @Column({ type: 'decimal', precision: 19, scale: 2 })
  value: number;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'decimal', precision: 19, scale: 2 })
  tax: number;

  @Column({ type: 'decimal', precision: 19, scale: 2 })
  total_operation: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
