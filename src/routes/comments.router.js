// import
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { prisma } from "../utils/prisma/index.js";

// comments.router.js - global variables
const router = express.Router();

// 댓글 생성 API
router.post("/posts/:postId/comments", authMiddleware, async (req, res, next) => {
	const { userId } = req.user;
	const { postId } = req.params;
	const { content } = req.body;

	const post = await prisma.posts.findFirst({ where: { postId: +postId } });
	// 게시글이 존재하지 않을 때 예외 처리
	if (!post) {
		return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
	}

	// 댓글 생성
	const comment = await prisma.comments.create({
		data: {
			content,
			UserId: +userId,
			PostId: +postId,
		},
	});

	return res.status(201).json({ data: comment });
});

// 댓글 조회 API
router.get("/posts/:postId/comments", async (req, res, next) => {
	const { postId } = req.params;

	const post = await prisma.posts.findFirst({ where: { postId: +postId } });
	// 게시글이 존재하지 않을 때 예외 처리
	if (!post) {
		return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
	}

	// 댓글 조회
	const comments = await prisma.comments.findMany({
		where: { PostId: +postId },
		// 최신순으로 정렬
		orderBy: { createdAt: "desc" },
	});

	return res.status(200).json({ data: comments });
});

// router 내보내기
export default router;
