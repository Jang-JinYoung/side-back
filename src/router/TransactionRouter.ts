import express, { Request, Response } from 'express';

import { AppDataSource } from '../config/DBconfig';
import { RecordTransaction } from '../models';
import authMiddleware from "./AuthMiddleWare";

const router = express.Router();
const recordTransactionRepository = AppDataSource.getRepository(RecordTransaction);


const getBetweenDate = (year:number, month: number) => {

    const monthStr = month ? month.toString().padStart(2, '0') : "04";
    const startDate = `${year}-${monthStr}-01`;
    const endDate = month == 12
    ? `${Number(year) + 1}-01-01`
    : `${year}-${(Number(monthStr) + 1).toString().padStart(2, '0')}-01`;
    return {startDate, endDate};
}
/**
 * 목록 조회
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {

        const year = req.query.year ?? new Date().getFullYear();
        const month = req.query.month ?? new Date().getMonth()+1;


        // const result = await recordTransactionRepository.find({
        //     relations: ['transactionCodeObj', 'categoryCodeObj'],
        //     select: {
        //       transactionId: true,
        //       transactionCode: true,
        //       categoryCode: true,
        //       transactionCodeObj: { codeKorName: true },
        //       categoryCodeObj: { codeKorName: true },
        //     },
        //   });

        const { startDate, endDate } = getBetweenDate(Number(year), Number(month));

        const result = await recordTransactionRepository
            .createQueryBuilder('A')
            .innerJoin('CommonCode', 'B', 'A.transactionCode = B.code')
            .innerJoin('CommonCode', 'C', 'A.categoryCode = C.code')
            .select([
                'A.transactionId AS transactionId',
                'DATE_FORMAT(A.transactionDate, "%Y-%m-%d") AS transactionDate',
                'A.amount AS amount',
                'A.description AS description',
                'A.transactionCode AS transactionCode',
                'B.CodeKorName AS transactionCodeName',
                'A.categoryCode AS categoryCode',
                'C.CodeKorName AS categoryCodeName',
            ])
            .where('A.useYn = :useYn', { useYn: 1 })
            .andWhere('A.delYn = :delYn', { delYn: 0 })
            .andWhere('A.transactionDate >= :startDate AND A.transactionDate < :endDate', { startDate, endDate })
            .orderBy('A.transactionDate')
            .getRawMany();

        // const test = await recordTransactionRepository.findOne({
        //     where:   { useYn: 1, delYn: 0 },  // 조건절
        // })
        // recordTransactionRepository.joi
        // const result = await recordTransactionRepository.findBy(
        //     { useYn: 1, delYn: 0 } // 조건절
        // );

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * 입금/지출/잔액 통계
 */
router.get('/statistics', async (req: Request, res: Response) => {
    try {

        const year = req.query.year ?? new Date().getFullYear();
        const month = req.query.month ?? new Date().getMonth()+1;

        const { startDate, endDate } = getBetweenDate(Number(year), Number(month));


        const getResult = async (transactionCode: string, alias: string) => {
            return await recordTransactionRepository.createQueryBuilder('transaction')
            .select('COALESCE(SUM(transaction.amount), 0)', alias)
            .where(
              'transaction.transactionCode = :transactionCode and transaction.useYn = :useYn and transaction.delYn = :delYn',
              { transactionCode, useYn: 1, delYn: 0 }
            )
            .andWhere('transactionDate >= :startDate AND transactionDate < :endDate', { startDate, endDate })
            .getRawOne();
        }
        const { income } = await getResult("10000001", "income");
        const {expense} = await getResult("10000002", "expense");

        res.status(200).json({ income: Number(income), expense: Number(expense), balance: income-expense });
    } catch (error) {
        console.error('Error inserting transaction:', error);
    }
});



/**
 * 상세 조회
 */
router.get('/:transactionId', async (req: Request, res: Response) => {
    try {

        const transactionId = Number(req.params.transactionId);

        const result = await recordTransactionRepository.findOneBy(
            { useYn: 1, delYn: 0, transactionId } // 조건절
        );

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * 등록
 */
router.post('/', async (req: Request, res: Response) => {
    try {

        const newTransaction = new RecordTransaction();

        newTransaction.transactionDate = req.body.transactionDate;
        newTransaction.transactionCode = req.body.transactionCode;
        newTransaction.amount = req.body.amount;
        newTransaction.categoryCode = req.body.categoryCode;
        newTransaction.description = req.body.description;
        newTransaction.userId = "user123";

        const result = await recordTransactionRepository.save(newTransaction);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error inserting transaction:', error);
    }
});

/**
 * 수정
 */
router.put('/update/:transactionId', async (req: Request, res: Response) => {
    try {

        const transaction: RecordTransaction = req.body;
        const transactionId = Number(req.params.transactionId);

        const result = await recordTransactionRepository.update(
            { transactionId }, // 조건
            { // 변경할 값
                transactionDate: transaction.transactionDate,
                transactionCode: transaction.transactionCode,
                categoryCode: transaction.categoryCode,
                amount: transaction.amount,
                description: transaction.description,
                lastChgDtm: new Date(),
            }
        );

        if (result.affected === 0) {
            res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error inserting transaction:', error);
    }
});

/**
 * 삭제
 */
router.put('/delete/:transactionId', async (req: Request, res: Response) => {
    try {

        const transactionId = Number(req.params.transactionId);

        // 삭제 수행
        const result = await recordTransactionRepository.update(
            { transactionId }, // 조건
            { delYn: 1 } // 변경할 값
        );

        if (result.affected === 0) {
            res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error inserting transaction:', error);
    }
});


export default router;