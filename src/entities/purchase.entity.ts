import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Operations } from './operations.entity';
import { Sale } from './sale.entity';
import { StockRegistration } from './stock-registration.entity';

@Entity({ name: 'purchase' })
export class Purchase extends StockRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['OPEN', 'CLOSE'], default: 'OPEN' })
  status: string;

  @OneToMany(() => Sale, (sale) => sale.purchase_ticket_id)
  operations: Sale[];

  @OneToMany(() => Operations, (operations) => operations.purchase_ticket_id)
  operations_purchase_id: Operations[];
}
