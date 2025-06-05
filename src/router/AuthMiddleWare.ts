import { redisClient } from "../config/redisConfig";
import { NextFunction, Request, RequestHandler, Response } from "express";

const authMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    // 1.1 Authorization 헤더 확인
    const authHeader = req.headers.authorization;

    // 1.2 헤더가 없는 경우
    if (!authHeader) {
        res.status(401).json({ error: 'Authorization header required' });
        return; // 🔑 void 반환
      }
    
    // 1.3 Bearer 토큰 형식 확인
    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
        res.status(401).json({ error: 'Invalid token format. Use: Bearer <token>' });
        return;
      }
    

    // 1.4 토큰 검증 로직 (예: JWT 검증)
    const result = await redisClient.get(token);
    if(!result) {
        res.status(403).json({ error: 'Invalid or expired token' });
        return;
    }

    next();
};

export default authMiddleware;