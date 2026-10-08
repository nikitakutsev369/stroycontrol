/**
 * Система ошибок через tagged unions (discriminated unions)
 * Функциональный подход — проще сериализовать, нет проблем с instanceof
 */

// === Базовый тип ошибки ===
export type AppError = {
  tag: 'app_error';
  status: number;
  message: string;
};

// === Фабрика ошибок ===
function appError(status: number, message: string): AppError {
  return { tag: 'app_error', status, message };
}

// === Фабрики конкретных ошибок ===
export const Errors = {
  // 4xx — клиентские ошибки
  badRequest: (msg: string) => appError(400, msg),
  unauthorized: (msg: string) => appError(401, msg),
  forbidden: (msg: string) => appError(403, msg),
  notFound: (msg: string) => appError(404, msg),
  conflict: (msg: string) => appError(409, msg),
  
  // 5xx — серверные ошибки
  internal: (msg: string) => appError(500, msg),
  networkError: (msg: string) => appError(503, msg),
} as const;

// === Сообщения об ошибках ===
export const ErrorMessages = {
  // Авторизация
  unauthenticated: 'Требуется авторизация',
  insufficientRole: 'Недостаточно прав',
  invalidCredentials: 'Неверные учётные данные',
  sessionExpired: 'Сессия истекла. Войдите снова.',
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

// === Утилиты ===
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'tag' in error &&
    error.tag === 'app_error'
  );
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
    console.error(`[HTTP ${error.status}] ${error.message}`);
    return;
  }
  console.error('Unhandled error:', error);
}
