// import
import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma/index.js";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/auth.middleware.js";

// users.router.js - global variables
const router = express.Router();

// 회원가입 API
router.post("/sing-up", async (req, res, next) => {
	try {
		const { email, password, name, age, gender, profileImage } = req.body;

		// 이메일 중복 체크
		const isExistUser = await prisma.users.findFirst({ where: { email } });
		if (isExistUser) {
			return res
				.status(409)
				.json({ errorMessage: "이미 존재하는 이메일 입니다." });
		}

		// 비밀번호 암호화
		const hashedPassword = await bcrypt.hash(password, 10);

		// Users 테이블에 사용자 생성
		const user = await prisma.users.create({
			data: {
				email,
				password: hashedPassword,
			},
		});

		//  UserInfos 테이블에 사용자 정보 생성
		const userInfo = await prisma.userInfos.create({
			data: {
				UserId: user.userId,
				name,
				age,
				gender: gender.toUpperCase(), // 전달받은 gender를 대문자로 변환
				profileImage,
			},
		});

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

	// 로그인 성공 시 JWT 발급
	const token = jwt.sign(
		{
			userId: user.userId,
		},
		"token_secret_key", // token 비밀키. env를 이용하여 코드를 숨겨야한다.
	);

	// 쿠키에 토큰 저장
	res.cookie("authorization", `Bearer ${token}`);
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

// router 내보내기
export default router;
