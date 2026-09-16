export class DomainError extends Error {
  constructor(public code: string, message: string, public statusCode = 400) { super(message); this.name = "DomainError"; }
}

export const notFound = (message = "موردی پیدا نشد") => new DomainError("NOT_FOUND", message, 404);
export const forbidden = () => new DomainError("NOT_FOUND", "موردی پیدا نشد", 404);
