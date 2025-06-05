import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { encrypt, decrypt } from "../util/encrpyt";

@Entity({ name: 'User' })
export class User {

    @PrimaryGeneratedColumn({ name: 'userId' })
    userId!: number;

    @Column({
        type: "varchar",
        nullable: false,
        transformer: {
            to: (value: string) => encrypt(value),
            from: (value: string) => decrypt(value),
        },
    })
    email!: string;

    @Column({
        type: "varchar",
        nullable: false,
        transformer: {
            to: (value: string) => encrypt(value),
            from: (value: string) => decrypt(value),
        },
    })
    name!: string;

    @CreateDateColumn({
        name: 'joinDate',
        type: 'datetime',
        comment: '가입일',
    })
    joinDate!: Date;

    @Column({ name: 'paidYn', type: 'tinyint', default: () => "0", comment: '구독여부' })
    paidYn!: number;

    @Column({ type: 'varchar', length: 8, nullable: false })
    signUpCode!: string;

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