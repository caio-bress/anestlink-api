export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string

  constructor(message: string, statusCode: number = 400, code: string = 'BAD_REQUEST') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype)
  }

  static unauthorized(message = 'Não autorizado') {
    return new AppError(message, 401, 'UNAUTHORIZED')
  }

  static forbidden(message = 'Acesso negado') {
    return new AppError(message, 403, 'FORBIDDEN')
  }

  static notFound(message = 'Recurso não encontrado') {
    return new AppError(message, 404, 'NOT_FOUND')
  }

  static conflict(message = 'Recurso já existe') {
    return new AppError(message, 409, 'CONFLICT')
  }

  static internal(message = 'Erro interno no servidor') {
    return new AppError(message, 500, 'INTERNAL_SERVER_ERROR')
  }
}