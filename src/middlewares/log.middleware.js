// import
import winston from "winston";

// 로그 설정
const logger = winston.createLogger({
	// 로그 레벨을 'info'로 설정
	level: "info",
	// 로그 포맷을 JSON 형식으로 설정
	format: winston.format.json(),
	// 로그를 콘솔에 출력
	transports: [new winston.transports.Console()],
});

// 미들웨어 실행되는 부분
export default function (req, res, next) {
	// 클라이언트의 요청이 시작된 시간을 기록
	const start = new Date().getTime();

	// 응답이 완료되면 로그를 기록
	res.on("finish", () => {
		const duration = new Date().getTime() - start;
		logger.info(
			`Method: ${req.method}, URL: ${req.url}, Status: ${res.statusCode}, Duration: ${duration}ms`,
		);
	});

	next();
}
