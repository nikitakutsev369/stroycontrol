/**
 * Централизованные ошибки приложения
 * Используются для единообразной обработки ошибок в UI и API
 */

// === Базовый класс ===
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// === Ошибки авторизации ===
export class AuthError extends AppError {
  constructor(message: string = ErrorMessages.unauthenticated, code: string = 'AUTH_ERROR') {
    super(message, code, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = ErrorMessages.insufficientRole, code: string = 'FORBIDDEN') {
    super(message, code, 403);
  }
}

export class SessionExpiredError extends AppError {
  constructor(message: string = 'Сессия истекла. Войдите снова.') {
    super(message, 'SESSION_EXPIRED', 401);
  }
}

// === Ошибки валидации ===
export class ValidationError extends AppError {
  public readonly fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message, 'VALIDATION_ERROR', 400);
    this.fields = fields;
  }
}

// === Ошибки данных ===
export class NotFoundError extends AppError {
  constructor(entity: string, id?: string) {
    super(
      id ? `${entity} с ID "${id}" не найден` : `${entity} не найден`,
      'NOT_FOUND',
      404
    );
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

// === Сообщения об ошибках ===
export const ErrorMessages = {
  // Авторизация
  unauthenticated: 'Требуется авторизация',
  insufficientRole: 'Недостаточно прав',
  invalidCredentials: 'Неверные учётные данные',
  sessionExpired: 'Сессия истекла',
  pinRequired: 'PIN-код обязателен',
  
  // Валидация
  requiredField: (field: string) => `Поле "${field}" обязательно`,
  invalidEmail: 'Некорректный email',
  invalidPhone: 'Некорректный телефон',
  invalidDate: 'Некорректная дата',
  endDateBeforeStart: 'Дата окончания не может быть раньше даты начала',
  progressOutOfRange: 'Прогресс должен быть от 0 до 100',
  
  // Данные
  notFound: (entity: string) => `${entity} не найден`,
  alreadyExists: (entity: string) => `${entity} уже существует`,
  cannotDelete: (reason: string) => `Невозможно удалить: ${reason}`,
  
  // Сеть
  networkError: 'Ошибка сети. Проверьте подключение.',
  serverError: 'Ошибка сервера. Попробуйте позже.',
  timeout: 'Превышено время ожидания',
} as const;

// === Коды ошибок ===
export const ErrorCodes = {
  // Auth
  AUTH_ERROR: 'AUTH_ERROR',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // Data
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  
  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
} as const;

// === Утилиты ===
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Произошла неизвестная ошибка';
}

export function handleError(error: unknown): void {
  if (isAppError(error)) {
    console.error(`[${error.code}] ${error.message}`);
    return;
  }
  console.error('Unhandled error:', error);
}
