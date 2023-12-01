// import
import express from "express";
import cookieParser from "cookie-parser";
import UsersRouter from "./routes/users.router.js";
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
app.use("/api", [UsersRouter]);
app.use(errorHandlingMiddleware);

// 서버 구동
app.listen(PORT, () => {
	console.log(PORT, "포트로 서버 구동");
});
