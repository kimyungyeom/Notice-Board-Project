// import
import express from "express";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import UsersRouter from "./routes/users.router.js";
import PostsRouter from "./routes/posts.router.js";
import CommentsRouter from "./routes/comments.router.js";
import logMiddleware from "./middlewares/log.middleware.js";
import errorHandlingMiddleware from "./middlewares/error-handling.middleware.js";

// port
const PORT = 3018;

// app.js - global variables
const app = express();

// global middlewares
app.use(logMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use(expressSession());
app.use("/api", [UsersRouter, PostsRouter, CommentsRouter]);
app.use(errorHandlingMiddleware);

// 서버 구동
app.listen(PORT, () => {
	console.log(PORT, "포트로 서버 구동");
});
