export function apiSuccess<T>(data: T) {
  return {
    ok: true,
    data,
  };
}

export function apiError(message: string) {
  return {
    ok: false,
    error: message,
  };
}