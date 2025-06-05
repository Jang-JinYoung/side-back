import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'CommonCode' })
export class CommonCode {
    @PrimaryColumn({ name: 'code', type: 'varchar', length: 8, comment: '코드' })
    code!: number;

    @Column({ name: 'parentCode', type: 'varchar', length: 8, nullable: true, comment: '부모코드' })
    parentCode?: string;

    @Column({ name: 'codeKorName', type: 'varchar', length: 100, comment: '코드 한글명' })
    codeKorName!: string;

    @Column({ name: 'codeName', type: 'varchar', length: 100, comment: '코드이름' })
    codeName!: string;

    @Column({ name: 'description', type: 'varchar', length: 100, nullable: true, comment: '상세설명' })
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
