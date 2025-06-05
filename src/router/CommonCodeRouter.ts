import express, { Request, Response } from 'express';
import { AppDataSource } from '../config/DBconfig';
import { RecordTransaction, CommonCode } from '../models';
import { IsNull, Not } from "typeorm"; // ✅ IsNull 추가


const router = express.Router();
const commonCodeRepository = AppDataSource.getRepository(CommonCode);

/**
 * 전체 목록 조회
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await commonCodeRepository.findBy(
            { useYn: 1, delYn: 0 } // 조건절
        );

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * 코드 조회
 */
router.get('/:codeName', async (req: Request, res: Response) => {
    try {

        const codeName = req.params.codeName;

        const result = await commonCodeRepository.findBy(
            { useYn: 1, delYn: 0, codeName, parentCode: Not(IsNull()) } // 조건절
        );

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
