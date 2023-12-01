// import
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

// 사용자 인증 미들웨어
export default async function (req, res, next) {
	// 서버 꺼지는 것을 방지
	try {
		// 쿠키 가져오기
		const { authorization } = req.cookies;

		const [tokenType, token] = authorization.split(" ");
		// 토큰 타입 검증
		if (tokenType !== "Bearer") {
			throw new Error("토큰 타입이 일치하지 않습니다.");
		}

		// 서버에서 발급한 JWT 확인 검증
		const decodeToken = jwt.verify(token, "token_secret_key");
		const userId = decodeToken.userId;

		// JWT의 userId를 이용해 사용자 조회
		const user = await prisma.users.findFirst({
			where: { userId: +userId },
		});
		if (!user) {
			res.clearCookie("authorization");
			throw new Error("사용자가 존재하지 않습니다.");
		}

		// 조회된 사용자 정보 할당
		req.user = user;

		// 다음 미들웨어 실행
		next();
	} catch (error) {
		// 특정 쿠키 삭제
		res.clearCookie("authorization");

		switch (error.name) {
			// 토큰 만료 에러처리
			case "TokenExpiredError":
				return res.status(401).json({ errorMessage: "검증에 실패하였습니다." });
				break;
			// 토큰 검증 실패 에러처리
			case "JsonWebTokenError":
				return res.status(401).json({ errorMessage: "검증에 실패하였습니다." });
				break;
			default:
				return res
					.status(401)
					.json({ errorMessage: error.message ?? "비정상적인 접근입니다." });
		}
	}
}
