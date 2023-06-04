import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Operations } from './operations.entity';
import { Purchase } from './purchase.entity';

@Entity({ name: 'sale' })
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Purchase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_ticket_id' })
  purchase_ticket_id: Purchase;

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

  @Column({ type: 'decimal', precision: 19, scale: 4 })
  irrf: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Operations, (operations) => operations.sale_ticket_id)
  operations_purchase_id: Operations[];
}
