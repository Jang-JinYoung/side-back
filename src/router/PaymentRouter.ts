import express, { Request, Response } from "express";

import { AppDataSource } from "../config/DBconfig";
import { RecordTransaction } from "../models";
import authMiddleware from "./AuthMiddleWare";
import request from "request";
// import fetch from '';

const router = express.Router();

interface IRequest extends Request {
    userInfo?: {
        userId: string;
        name: string;
    };
}

router.post("/", authMiddleware, async (req: IRequest, res: Response) => {
    try {
        const secretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";

        const { paymentKey, orderId, amount } = req.body;

        // 토스페이먼츠 API는 시크릿 키를 사용자 ID로 사용하고, 비밀번호는 사용하지 않습니다.
        // 비밀번호가 없다는 것을 알리기 위해 시크릿 키 뒤에 콜론을 추가합니다.
        // @docs https://docs.tosspayments.com/reference/using-api/authorization#%EC%9D%B8%EC%A6%9D
        const encryptedSecretKey =
            "Basic " + Buffer.from(secretKey + ":").toString("base64");

        // ------ 결제 승인 API 호출 ------
        // @docs https://docs.tosspayments.com/guides/v2/payment-widget/integration#결제-승인-api-호출하기
        const response = await fetch(
            "https://api.tosspayments.com/v1/payments/confirm",
            {
                method: "POST",
                body: JSON.stringify({ orderId, amount, paymentKey }),
                headers: {
                    Authorization: encryptedSecretKey,
                    "Content-Type": "application/json",
                },
            }
        );
        const data = await response.json();

        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


export default router;