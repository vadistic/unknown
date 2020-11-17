import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'
import { ApiProperty } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'

import { BaseModel } from '../../../common/base/base.model'

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User role',
})

@ObjectType('User')
export class UserModel extends BaseModel {
  @Field()
  @ApiProperty()
  email: string

  @Field({ nullable: true })
  @ApiProperty({ type: String, required: false })
  firstname?: string

  @ApiProperty({ type: String, required: false })
  lastname?: string

  @Field(type => UserRole)
  @ApiProperty({ enum: UserRole })
  role: UserRole
}
