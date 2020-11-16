import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'

import { mailSubjectMap } from './mail-subjects'
import { MailProps, MailType } from './mail.types'

export interface SendMessageInfo {
  accepted: string[]
  rejectd: string[]
  envelopeTime: number
  messageTime: number
  messageSize: number
  response: string
  envelope: { from: string; to: string[] }
  messageId: string
}

@Injectable()
export class MailService {
  constructor(readonly mailer: MailerService) {}

  async sendMail<T extends MailType>(
    template: T,
    user: User,
    props: MailProps<T>,
  ): Promise<SendMessageInfo> {
    const name = this.getName(user)
    const templateProps = { ...props, name } as any

    const info = await this.mailer.sendMail({
      to: { name: name, address: user.email },
      subject: mailSubjectMap[template](templateProps),
      template: template,
      context: templateProps,
    })

    return info as SendMessageInfo
  }

  getName({ firstname, lastname, email }: User) {
    if (firstname) return firstname

    if (lastname) return lastname

    return email.replace(/@.*/, '')
  }
}
