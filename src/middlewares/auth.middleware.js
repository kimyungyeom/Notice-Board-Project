// import
import { prisma } from "../utils/prisma/index.js";

// 사용자 인증 미들웨어
export default async function (req, res, next) {
	// 서버 꺼지는 것을 방지
	try {
		const { userId } = req.session;
		// userId가 존재하지 않을 때 예외 처리
		if (!userId) {
			throw new Error("로그인이 필요합니다.");
		}

		// JWT의 userId를 이용해 사용자 조회
		const user = await prisma.users.findFirst({
			where: { userId: +userId },
		});
		// user가 존재하지 않을 때 예외 처리
		if (!user) {
			throw new Error("사용자가 존재하지 않습니다.");
		}

		// 조회된 사용자 정보 할당
		req.user = user;

		// 다음 미들웨어 실행
		next();
	} catch (error) {
		switch (error.name) {
			default:
				return res.status(401).json({ errorMessage: error.message ?? "비정상적인 접근입니다." });
		}
	}
}
