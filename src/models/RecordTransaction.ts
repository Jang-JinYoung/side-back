import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CommonCode } from './CommonCode';

@Entity({ name: 'RecordTransaction' })
export class RecordTransaction {
  @PrimaryGeneratedColumn({ name: 'transactionId' })
  transactionId!: number;

  @Column({ name: 'transactionDate', type: 'date', comment: '거래일자' })
  transactionDate!: string;

  @Column({ name: 'transactionCode', type: 'varchar', length: 8, comment: '입,출금 코드' })
  transactionCode!: string;

  // transactionCode와 CommonCode의 관계
  @ManyToOne(() => CommonCode)
  @JoinColumn({ name: 'transactionCode', referencedColumnName: 'code' })
  transactionCodeObj!: CommonCode;

  @Column({ name: 'categoryCode', type: 'varchar', length: 8, comment: '카테고리 코드' })
  categoryCode!: string;
  
  // categoryCode와 CommonCode의 관계
  @ManyToOne(() => CommonCode)
  @JoinColumn({ name: 'categoryCode', referencedColumnName: 'code' })
  categoryCodeObj!: CommonCode;

  @Column({ name: 'userId', type: 'varchar', length: 255, comment: '거래유저' })
  userId!: string;

  @Column({ name: 'amount', type: 'int', comment: '금액' })
  amount!: number;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true, comment: '상세설명' })
  description?: string;

  @Column({ name: 'useYn', type: 'tinyint', default: () => "1", comment: '사용유무' })
  useYn!: number;

  @Column({ name: 'delYn', type: 'tinyint', default: () => "0", comment: '삭제유무' })
  delYn!: number;

  @Column({ name: 'frstRegUserId', type: 'varchar', length: 50, comment: '최초등록자' })
  frstRegUserId!: string;

  @CreateDateColumn({
    name: 'frstRegDtm',
    type: 'datetime',
    comment: '최초등록일',
  })
  frstRegDtm!: Date;

  @Column({ name: 'lastChgUserId', type: 'varchar', length: 50, comment: '최종수정자' })
  lastChgUserId!: string;

  @UpdateDateColumn({
    name: 'lastChgDtm',
    type: 'datetime',
    comment: '최종수정일',
  })
  lastChgDtm!: Date;
}
