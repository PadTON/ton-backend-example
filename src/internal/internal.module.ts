import { Module } from '@nestjs/common'
import { UserIdentityInternalController } from './internal.controller';
import { UsersModule } from 'src/users/user.module';
import { UsersInternalModule } from 'src/users/user.internal.module';

@Module({
	imports: [UsersInternalModule],
	controllers: [UserIdentityInternalController],
	
})
export class UsersIndentityInternalModule {}
