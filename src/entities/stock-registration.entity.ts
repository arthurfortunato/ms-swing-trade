import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'stock_registration' })
export class StockRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['PURCHASE', 'SALE'] })
  type: string;

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

  @Column({ type: 'decimal', precision: 19, scale: 2, default: 0 })
  total_operation: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
