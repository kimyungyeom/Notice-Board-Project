// import
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { prisma } from "../utils/prisma/index.js";

// posts.router.js - global variables
const router = express.Router();

// 게시글 생성 API
router.post("/posts", authMiddleware, async (req, res) => {
	const { userId } = req.user;
	const { title, content } = req.body;

	// Posts 테이블에 게시글 생성
	const post = await prisma.posts.create({
		data: {
			UserId: userId,
			title,
			content,
		},
	});

	return res.status(201).json({ data: post });
});

// 게시글 목록 조회 API
router.get("/posts", async (req, res, next) => {
	const posts = await prisma.posts.findMany({
		select: {
			postId: true,
			title: true,
			createdAt: true,
			updatedAt: true,
		},
		// 정렬 기능 추가. 생성일을 기준으로 내림차순 정렬
		// 오름차순으로 하기 위해서는 asc
		orderBy: {
			createdAt: "desc",
		},
	});

	return res.status(200).json({ data: posts });
});

// 게시글 상세 조회 API
router.get("/posts/:postId", async (req, res, next) => {
	const { postId } = req.params;
	const post = await prisma.posts.findFirst({
		where: { postId: +postId },
		select: {
			postId: true,
			title: true,
			content: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	return res.status(200).json({ data: post });
});

// router 내보내기
export default router;
