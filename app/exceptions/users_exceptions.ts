export class UserAlreadyExists extends Error {
  name: string = 'USER_ALREADY_EXISTS'
}

export class InvalidEmailAndOrPassword extends Error {
  name: string = 'INVALID_EMAIL_AND_OR_PASSWORD'
}
