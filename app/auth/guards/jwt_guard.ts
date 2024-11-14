import { errors, symbols } from '@adonisjs/auth'
import { AuthClientResponse, GuardContract } from '@adonisjs/auth/types'
import type { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'

export type JwtGuardUser<RealUser> = {
  getId(): string | number | BigInt

  getOriginal(): RealUser
}

export type JwtGuardOptions = {
  secret: string
}

export interface JwtUserProviderContract<RealUser> {
  [symbols.PROVIDER_REAL_USER]: RealUser

  createUserForGuard(user: RealUser): Promise<JwtGuardUser<RealUser>>

  findById(identifier: string | number | BigInt): Promise<JwtGuardUser<RealUser> | null>
}

export class JwtGuard<UserProvider extends JwtUserProviderContract<unknown>>
  implements GuardContract<UserProvider[typeof symbols.PROVIDER_REAL_USER]>
{
  declare [symbols.GUARD_KNOWN_EVENTS]: {}
  driverName: 'jwt' = 'jwt'
  authenticationAttempted: boolean = false
  isAuthenticated: boolean = false
  user?: UserProvider[typeof symbols.PROVIDER_REAL_USER]

  constructor(
    private userProvider: UserProvider,
    private options: JwtGuardOptions,
    private ctx: HttpContext
  ) {}

  async generate(user: UserProvider[typeof symbols.PROVIDER_REAL_USER]) {
    const providerUser = await this.userProvider.createUserForGuard(user)
    const accessToken = jwt.sign({ id: providerUser.getId() }, this.options.secret, {
      expiresIn: '1h',
    })

    return { type: 'bearer', access_token: accessToken, expires_in: 3600 }
  }

  async authenticate(): Promise<UserProvider[typeof symbols.PROVIDER_REAL_USER]> {
    if (this.authenticationAttempted) return this.getUserOrFail()
    this.authenticationAttempted = true

    const authHeader = this.ctx.request.header('authorization')
    if (!authHeader)
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: this.driverName,
      })

    const [, accessToken] = authHeader.split('Bearer ')
    if (!accessToken)
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: this.driverName,
      })

    const payload = jwt.verify(accessToken, this.options.secret)
    if (typeof payload !== 'object' || !('userId' in payload))
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: this.driverName,
      })

    const providerUser = await this.userProvider.findById(payload.userId)
    if (!providerUser)
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: this.driverName,
      })

    this.user = providerUser.getOriginal()
    return this.getUserOrFail()
  }

  async check(): Promise<boolean> {
    try {
      await this.authenticate()
      return true
    } catch {
      return false
    }
  }

  getUserOrFail(): UserProvider[typeof symbols.PROVIDER_REAL_USER] {
    if (!this.user)
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: this.driverName,
      })

    return this.user
  }

  async authenticateAsClient(
    user: UserProvider[typeof symbols.PROVIDER_REAL_USER]
  ): Promise<AuthClientResponse> {
    const token = await this.generate(user)
    return {
      headers: {
        authorization: `Bearer ${token.access_token}`,
      },
    }
  }
}
