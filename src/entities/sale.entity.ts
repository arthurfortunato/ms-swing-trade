import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Operations } from './operations.entity';
import { Purchase } from './purchase.entity';
import { StockRegistration } from './stock-registration.entity';

@Entity({ name: 'sale' })
export class Sale extends StockRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Purchase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_ticket_id' })
  purchase_ticket_id: Purchase;

  @Column({ type: 'decimal', precision: 19, scale: 4 })
  irrf: number;

  @OneToMany(() => Operations, (operations) => operations.sale_ticket_id)
  operations_purchase_id: Operations[];
}
