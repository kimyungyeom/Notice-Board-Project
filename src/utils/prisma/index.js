// import
import { PrismaClient } from "@prisma/client";

// PrismaClient 인스턴스 생성
export const prisma = new PrismaClient({
	// Prisma를 이용하여 데이터베이스를 접근할 때, SQL을 출력
	log: ["query", "info", "warn", "error"],

	// 에러 메시지를 평문이 아닌 읽기 쉬운 형태로 출력
	errorFormat: "pretty",
});
