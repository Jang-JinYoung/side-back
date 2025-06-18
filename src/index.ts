import "reflect-metadata"; // 반드시 첫 번째로 임포트해야 함
import express from "express";
import cors from "cors";
import { connectDB, corsOptions, redisClient } from "./config";
import commontCodeRouter from "./router/CommonCodeRouter";
import transactionRouter from "./router/TransactionRouter";
import loginRouter from "./router/LoginRouter";
import paymentRouter from "./router/PaymentRouter";
import bodyParser from "body-parser";

// Express 애플리케이션 초기화
const app = express();
app.use(cors(corsOptions));
app.use(express.json()); // ✅ 필수
app.use(bodyParser.urlencoded({ extended: true }));

// /transaction 라우터 연결 (우선 처리)
app.use("/transaction", transactionRouter);
app.use("/code", commontCodeRouter);
app.use("/login", loginRouter);
app.use("/payment", paymentRouter);

export interface IResponse {
  code: number; //
  message: string;
  data: any;
}

// 서버 시작
const startServer = async () => {
  await connectDB();

  app.listen(4000, () => {
    console.log("Server is running on http://localhost:4000");
  });
};

startServer();
