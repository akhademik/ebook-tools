// src/lib/types/result.type.ts

export type Result<T, E = string> = { success: true; data: T } | { success: false; error: E };

export class AppError extends Error {
	constructor(
		message: string,
		public code: string = 'APP_ERROR',
		public statusCode: number = 500,
		public details?: unknown
	) {
		super(message);
		this.name = 'AppError';
	}
}

export class ValidationError extends AppError {
	constructor(message: string, details?: unknown) {
		super(message, 'VALIDATION_ERROR', 400, details);
		this.name = 'ValidationError';
	}
}
