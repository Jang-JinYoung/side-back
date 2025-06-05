import express, { Request, Response } from "express";
import request from "request";
import jwt from "jsonwebtoken";
import { User } from "../models";
import { AppDataSource } from "../config/DBconfig";
import { redisClient } from "../config/redisConfig";

const router = express.Router();

const KAKAO_CODE = "10003002";
const NAVER_CODE = "10003003";

/*
todo 
어세스토큰 발급시점 accessTokenPublishDateTime
마지막로그인 lastLoginDateTime

*/

const userRepository = AppDataSource.getRepository(User);

type SuccessResponse = {
    code: 200;
    message: string;
    access_token: string;
    email?: string;
    name?: string;
};

type ErrorResponse = {
    code: Exclude<number, 200>;
    message: string;
    access_token?: null;
    email?: string;
    name?: string;
};

type ApiResponse = SuccessResponse | ErrorResponse;

const kakaoLogin = async (code: string) => {
    // Step 1: Access Token 요청
    const getToken = async (): Promise<ApiResponse> => {
        const client_id = "15859967b0580a93f6ddcd00d24f795c";
        const redirect_uri = encodeURI("http://localhost:3000/callback/kakao");

        return new Promise((resolve, reject) => {
            const options = {
                url: `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${client_id}&redirect_uri=${redirect_uri}&code=${code}`,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            };

            request.get(options, (error, response, body) => {
                const result = JSON.parse(body);
                if (!error && response.statusCode === 200) {
                    if (result.access_token) {
                        resolve({
                            code: 200,
                            message: "SUCCESS",
                            access_token: result.access_token,
                        });
                    } else {
                        resolve({ code: 500, message: "NOT_ACCESS_TOKEN" });
                    }
                } else {
                    console.error("Token request error:", result.error);
                    resolve({ code: 500, message: result.error });
                }
            });
        });
    };

    // Step 2: 사용자 정보 요청
    const getUserInfo = async (access_token: string) => {
        const userInfoOptions = {
            url: "https://kapi.kakao.com/v2/user/me",
            method: "POST",
            headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type":
                    "application/x-www-form-urlencoded;charset=utf-8",
            },
        };

        return new Promise<{
            code: number;
            message: string;
            nickname?: string;
            email?: string;
        }>((resolve, reject) => {
            request(userInfoOptions, (error, response, body) => {
                const result = JSON.parse(body);
                if (!error && response.statusCode === 200) {
                    if (result.kakao_account) {
                        const nickname = result.kakao_account.profile.nickname;
                        const email = result.kakao_account.email;
                        resolve({
                            code: 200,
                            message: "SUCCESS",
                            nickname,
                            email,
                        });
                    } else {
                        resolve({ code: 500, message: "NOT_USER_INFO" });
                    }
                } else {
                    console.error("Token request error:", result.error);
                    resolve({ code: 500, message: result.error });
                }
            });
        });
    };

    const tokenData = await getToken();
    if (tokenData.code === 200 && tokenData.access_token) {
        const userData = await getUserInfo(tokenData.access_token);
        return userData;
    } else {
        return tokenData;
    }
};

const naverLogin = async (code: string) => {
    const getToken = (): Promise<ApiResponse> => {
        const client_id = "h9rA5YtXEZYFtXZ1pKKe";
        const client_secret = "l0ajWRPLGk";
        const redirect_uri = encodeURI("http://localhost:3000/callback/naver");
        const api_url = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}&code=${code}`;

        const options = {
            url: api_url,
            headers: {
                "X-Naver-Client-Id": client_id,
                "X-Naver-Client-Secret": client_secret,
            },
        };

        return new Promise((resolve, reject) => {
            request.post(options, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    try {
                        const parsedBody = JSON.parse(body);
                        const access_token = parsedBody.access_token;
                        if (access_token) {
                            resolve({
                                code: 200,
                                message: "SUCCESS",
                                access_token,
                            });
                        } else {
                            //   console.log("NOT ACCESS TOKEN");
                            resolve({ code: 500, message: "NOT_ACCESS_TOKEN" });
                        }
                    } catch (e) {
                        console.error("Failed to parse token response:", e);
                        resolve({ code: 500, message: "NOT_ACCESS_TOKEN" });
                    }
                } else {
                    console.log("error = ", response?.statusCode, error);
                    resolve({ code: 500, message: "NOT_ACCESS_TOKEN" });
                }
            });
        });
    };

    // Step 2: 사용자 정보 요청
    const getUserInfo = async (access_token: string) => {
        const api_url = "https://openapi.naver.com/v1/nid/me";
        const header = "Bearer " + access_token;
        const options = {
            url: api_url,
            headers: { Authorization: header },
        };

        return new Promise<{
            code: number;
            message: string;
            email?: string;
            name?: string;
        }>((resolve, reject) => {
            request(options, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    const userInfo = JSON.parse(body);
                    /*
                    {
                        resultcode: '00',
                        message: 'success',
                        response: {
                            id: 'JNyOFz10DJrBwDmpee9YwsfwHbamBiSr05jKCPg9HpE',
                            email: 'jinyoung_8965@naver.com',
                            name: '장진영',
                            birthday: '05-10'
                        }
                    }
                     */
                    if (userInfo.resultcode === "00") {
                        resolve({
                            code: 200,
                            message: "SUCCESS",
                            email: userInfo.response.email,
                            name: userInfo.response.name,
                        });
                    } else {
                        resolve({ code: 500, message: "NOT_USER_INFO" });
                    }
                } else {
                    console.error("User info request error:", error || body);
                    resolve({ code: 500, message: "NOT_ACCESS_TOKEN" });
                }
            });
        });
    };

    const tokenData = await getToken();
    if (tokenData.code === 200 && tokenData.access_token) {
        return await getUserInfo(tokenData.access_token);
    } else {
        return tokenData;
    }
};

/** 로그인 */
const signIn = async (userInfo: any) => {
    const secretKey = "jyjang";
    const accessToken = jwt.sign({ userId: userInfo.userId }, secretKey, {
        expiresIn: "1h",
    });

    return new Promise(async (resolve, reject) => {
        const result = await redisClient.set(
            accessToken,
            JSON.stringify(userInfo),
            { EX: 24 * 60 * 60 }
        );
        // const result = "OK";
        if (result === "OK") {
            resolve(accessToken);
        } else {
            resolve(null);
        }
    });
};

/** 회원가입 */
const signUp = ({
    email,
    name,
    signUpCode,
}: {
    email: string;
    name: string;
    signUpCode: string;
}) => {
    const user = new User();

    user.email = email;
    user.name = name;
    user.signUpCode = signUpCode;
    user.paidYn = 0;
    user.useYn = 1;
    user.delYn = 0;
    user.joinDate = new Date();
    user.frstRegUserId = "SYSTEM";
    user.frstRegDtm = new Date();
    user.lastChgUserId = "SYSTEM";
    user.lastChgDtm = new Date();

    return userRepository.save(user);
};

router.get("/callback", async (req: Request, res: Response) => {
    try {
        const { code, sns } = req.query;

        if (typeof code === "string") {
            if (sns === "kakao") {
                const result = await kakaoLogin(code);
                res.status(200).json(result);
            } else if (sns === "naver") {
                // 네이버 로그인 -> 개인정보 가져옴
                const result = await naverLogin(code);

                if (result?.email && result?.name) {
                    // 유저정보 확인
                    let user = await userRepository.findOneBy({
                        useYn: 1,
                        delYn: 0,
                        email: result.email,
                    });

                    // 유저정보가 없으면 회원가입
                    if (!user) {
                        user = await signUp({
                            email: result.email,
                            name: result.name,
                            signUpCode: NAVER_CODE,
                        });
                    }

                    // 회원 가입
                    try {
                        const signInResult = await signIn(user);
                        if (signInResult) {
                            res.status(200).json({
                                code: 200,
                                message: "SUCCESS",
                                data: {
                                    accessToken: signInResult,
                                },
                            });
                        } else {
                            res.status(200).json({
                                code: 500,
                                message: "로그인 에러(토큰 발급 오류)",
                                data: null,
                            });
                        }
                    } catch (error) {
                        console.error("Error inserting transaction:", error);
                    }
                }

                // res.status(200).json(result);
            }
        } else {
        }
    } catch (error) {
        console.error("Error inserting transaction:", error);
    }
});

export default router;
