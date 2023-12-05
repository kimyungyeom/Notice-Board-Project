// import
import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { Prisma } from "@prisma/client";

// users.router.js - global variables
const router = express.Router();

// 회원가입 API
router.post("/sing-up", async (req, res, next) => {
	try {
		const { email, password, name, age, gender, profileImage } = req.body;

		// 이메일 중복 체크
		const isExistUser = await prisma.users.findFirst({ where: { email } });
		if (isExistUser) {
			return res.status(409).json({ errorMessage: "이미 존재하는 이메일 입니다." });
		}

		// 비밀번호 암호화
		const hashedPassword = await bcrypt.hash(password, 10);

		const [user, userInfo] = await prisma.$transaction(
			async (tx) => {
				// Users 테이블에 사용자 생성
				const user = await tx.users.create({
					data: {
						email,
						password: hashedPassword,
					},
				});

				//  UserInfos 테이블에 사용자 정보 생성
				const userInfo = await tx.userInfos.create({
					data: {
						UserId: user.userId,
						name,
						age,
						gender: gender.toUpperCase(), // 전달받은 gender를 대문자로 변환
						profileImage,
					},
				});

				return [user, userInfo];
			},
			{
				isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
			},
		);

		return res.status(201).json({
			message: "회원가입이 완료되었습니다.",
			data: userInfo,
		});
	} catch (err) {
		next(err);
	}
});

// 로그인 API
router.post("/sing-in", async (req, res, next) => {
	const { email, password } = req.body;

	// 유저 존재 여부 체크
	const user = await prisma.users.findFirst({ where: { email } });
	if (!user) {
		return res.status(401).json({ errorMessage: "존재하지 않는 유저입니다." });
	}

	// 비밀번호 비교
	const comparePassword = await bcrypt.compare(password, user.password);
	// 비밀번호 일치 여부 체크
	if (!comparePassword) {
		return res.status(401).json({ errorMessage: "로그인에 실패하였습니다." });
	}

	// 로그인 성공 시 세션에 Id 발급
	req.session.userId = user.userId;

	return res.status(200).json({ message: "로그인에 성공하였습니다." });
});

// 사용자 조회 API
router.get("/users", authMiddleware, async (req, res, next) => {
	// user 정보 할당
	const { userId } = req.user;

	const user = await prisma.users.findFirst({
		where: { userId: +userId },
		// 특정 컬럼 조회
		select: {
			userId: true,
			email: true,
			createdAt: true,
			updatedAt: true,
			UserInfos: {
				select: {
					name: true,
					age: true,
					gender: true,
					profileImage: true,
				},
			},
		},
	});

	// 조회한 사용자 상세정보 반환
	return res.status(200).json({ data: user });
});

// 사용자 정보 변경 API
router.patch("/users", authMiddleware, async (req, res, next) => {
	try {
		// 유저 정보 할당
		const { userId } = req.user;
		const updatedData = req.body;

		// 수정되기 전 사용자의 정보 데이터 조회
		const userInfo = await prisma.userInfos.findFirst({
			where: { UserId: +userId },
		});

		await prisma.$transaction(
			async (tx) => {
				// 사용자 정보 수정
				await tx.userInfos.update({
					data: {
						...updatedData,
					},
					where: {
						UserId: +userId,
					},
				});

				// 사용자 변경된 정보 사용자 히스토리 테이블에 저장
				for (let key in updatedData) {
					// 변경된 데이터가 있을 때에는,
					if (userInfo[key] !== updatedData[key]) {
						await tx.userHistories.create({
							data: {
								UserId: userInfo.UserId,
								changedField: key,
								// 변경되기 전 사용자 데이터
								oldValue: String(userInfo[key]),
								// 변경되고 난 뒤 사용자 데이터
								newValue: String(updatedData[key]),
							},
						});
					}
				}
			},
			{
				isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
			},
		);
		// 사용자 정보 변경 API 완료
		return res.status(200).json({ message: "사용자 정보 변경에 성공하였습니다." });
	} catch (err) {
		next(err);
	}
});

// router 내보내기
export default router;
