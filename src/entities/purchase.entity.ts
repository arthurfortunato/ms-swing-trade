import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Sale } from './sale.entity';

@Entity({ name: 'purchase' })
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['OPEN', 'CLOSE'], default: 'OPEN' })
  status: string;

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

  @OneToMany(() => Sale, (sale) => sale.purchase_id)
  operations: Sale[];
}
