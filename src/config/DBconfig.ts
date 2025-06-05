
// import { CommonCode } from "../models/CommonCode";
// import { RecordTransaction } from "../models/RecordTransaction";
import { CommonCode, RecordTransaction, User } from "../models";
import { DataSource } from "typeorm";

import fs from "fs";
import path from "path";
import yaml from "js-yaml";

interface IKey {
    db: {

        host: string;
        port: number,
        username: string;
        password: string;
        database: string;
    }

    
}

const configPath = path.join(
    process.cwd(),
    "node_modules",
    "my-config-repo",
    "key.yaml"
);

const config = yaml.load(fs.readFileSync(configPath, "utf8")) as IKey;


export const AppDataSource = new DataSource({
    type: 'mysql',
    entities: [RecordTransaction, CommonCode, User], // 엔티티 클래스 등록
    synchronize: false,  // 개발 시 테이블을 자동으로 동기화 (운영 환경에서는 false로 설정해야 함)
    logging: false,      // SQL 쿼리 로그 출력
    host: config.db.host,
    port: 3306,
    username: 'admin', // MySQL 사용자명
    password: config.db.password, // MySQL 비밀번호
    database: 'jyjang', // MySQL 데이터베이스 이름
});


// MySQL 데이터베이스 연결 함수
// DataSource 객체를 사용하여 MySQL 연결 설정
export const connectDB = async () => {
    try {
        await AppDataSource.initialize();  // DataSource 


        console.log('Database connected successfully!');
    } catch (error) {
        console.error('Error during DataSource initialization:', error);
    }
};

module.exports = {
    connectDB, AppDataSource
}