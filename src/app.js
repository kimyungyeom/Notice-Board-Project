// import
import express from "express";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import expressMySQLSession from "express-mysql-session";
import dotEnv from "dotenv";
import UsersRouter from "./routes/users.router.js";
import PostsRouter from "./routes/posts.router.js";
import CommentsRouter from "./routes/comments.router.js";
import logMiddleware from "./middlewares/log.middleware.js";
import errorHandlingMiddleware from "./middlewares/error-handling.middleware.js";

// port
const PORT = 3018;

// app.js - global variables
const app = express();
dotEnv.config();

// MySQLStore
const MySQLStore = expressMySQLSession(expressSession);
const sessionStore = new MySQLStore({
	user: process.env.DATABASE_USERNAME,
	password: process.env.DATABASE_PASSWORD,
	host: process.env.DATABASE_HOST,
	port: process.env.DATABASE_PORT,
	database: process.env.DATABASE_NAME,
	// 세션 만료 기간 1일 설정
	expiration: 1000 * 60 * 60 * 24,
	// 세션 테이블 자동 생성
	createDatabaseTable: true,
});

// global middlewares
app.use(logMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use(
	expressSession({
		// 세션 비밀 키
		secret: process.env.SESSION_SECRET_KEY,
		resave: false,
		saveUninitialized: false,
		store: sessionStore,
		cookie: {
			// 쿠키 만료 기간 1일 설정
			maxAge: 1000 * 60 * 60 * 24,
		},
	}),
);
app.use("/api", [UsersRouter, PostsRouter, CommentsRouter]);
app.use(errorHandlingMiddleware);

// 서버 구동
app.listen(PORT, () => {
	console.log(PORT, "포트로 서버 구동");
});
