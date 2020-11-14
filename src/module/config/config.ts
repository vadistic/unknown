/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Type } from 'class-transformer'
import { IsOptional, IsPort, IsUrl } from 'class-validator'

import { toBool, toInt } from './config.utils'

const IS_DEV = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'

export class NestConfig {
  @IsUrl()
  url: string = process.env.URL ?? `http://localhost:${process.env.PORT ?? 3000}`

  @IsPort()
  port: number = toInt(process.env.PORT) ?? 3000

  corsEnabled: boolean = true
  cookiesEnabled: boolean = true
}

export class SmtpConfig {
  port: number = toInt(process.env.SMTP_PORT) ?? 1025
  host: string = process.env.SMTP_HOST ?? 'localhost'
  username: string = process.env.SMTP_USERNAME ?? 'localhost'
  password: string = process.env.SMTP_PASSWORD ?? 'localhost'
  tls: boolean = toBool(process.env.SMTP_TLS) ?? false
  sender: string = process.env.SMTP_SENDER ?? 'NestJS App'
  email: string = process.env.SMTP_EMAIL ?? 'mail@example.com'
}

export class DatabaseConfig {
  user: string = process.env.DB_USER ?? 'postgres'
  pasword: string = process.env.DB_PASSWORD ?? 'postgres'
  name: string = process.env.DB_NAME ?? 'dev'
  host: string = process.env.DB_HOST ?? 'localhost'

  @IsOptional()
  schema: string = process.env.DB_SCHEMA ?? 'public'

  @IsPort()
  port: number = toInt(process.env.DB_PORT) ?? 5432
}

export class SwaggerConfig {
  enabled: boolean = true
  title: string = 'NestJS API'
  description: string = 'The nestjs API description'
  version: string = '1.0.0'
  path: string = 'api'
}

export class GraphqlConfig {
  playgroundEnabled: boolean = true
  debug: boolean = IS_DEV
  schemaDestination: string = './src/schema.graphql'
  sortSchema: boolean = true
}

export class AuthConfig {
  expiresIn: string = IS_DEV ? '1d' : '2m'
  refreshIn: string = '7d'

  bcryptSaltOrRound: string | number = 10

  jwtSecret: string = process.env.JWT_SECRET ?? 'mySecret'

  googleClient: string = process.env.OAUTH_GOOGLE_CLIENT!
  googleSecret: string = process.env.OAUTH_GOOGLE_SECRET!
}

// ────────────────────────────────────────────────────────────────────────────────

export class Config {
  @Type(() => NestConfig)
  nest: NestConfig

  @Type(() => SmtpConfig)
  smtp: SmtpConfig

  @Type(() => SwaggerConfig)
  swagger: SwaggerConfig

  @Type(() => GraphqlConfig)
  graphql: GraphqlConfig

  @Type(() => AuthConfig)
  auth: AuthConfig

  @Type(() => DatabaseConfig)
  database: DatabaseConfig
}

export const configuration = (): Config => ({
  nest: new NestConfig(),
  smtp: new SmtpConfig(),
  swagger: new SwaggerConfig(),
  graphql: new GraphqlConfig(),
  auth: new AuthConfig(),
  database: new DatabaseConfig(),
})
