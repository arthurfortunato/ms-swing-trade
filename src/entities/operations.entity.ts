import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Purchase } from './purchase.entity';
import { Sale } from './sale.entity';

@Entity({ name: 'operations' })
export class Operations {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ticket: string;

  @ManyToOne(() => Purchase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_ticket_id' })
  purchase_ticket_id: Purchase;

  @Column({ type: 'decimal', precision: 19, scale: 2 })
  total_purchase: number;

  @ManyToOne(() => Sale, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_ticket_id' })
  sale_ticket_id: number;

  @Column({ type: 'decimal', precision: 19, scale: 2 })
  total_sale: number;

  @Column({ type: 'decimal', precision: 19, scale: 2 })
  gross_profit: number;
  
  @Column({ type: 'decimal', precision: 19, scale: 4 })
  irrf: number;

  @Column({ type: 'decimal', precision: 19, scale: 2 })
  darf: number;

  @Column({ type: 'decimal', precision: 19, scale: 2 })
  net_profit: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
