export const corsOptions = {
    origin: ['http://localhost:3000', 'http://3.37.127.128:4000'], // 허용할 클라이언트 주소
    credentials: true,              // 쿠키 사용을 허용
    optionsSuccessStatus: 200       // 응답 상태 설정
};


module.exports = {
    corsOptions,
}