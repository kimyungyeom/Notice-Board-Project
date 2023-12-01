// import
import express from "express";
import cookieParser from "cookie-parser";
import UsersRouter from "./routes/users.router.js";

// port
const PORT = 3018;

// app.js - global variables
const app = express();

// global middlewares
app.use(express.json());
app.use(cookieParser());
app.use("/api", [UsersRouter]);

// 서버 구동
app.listen(PORT, () => {
	console.log(PORT, "포트로 서버 구동");
});
