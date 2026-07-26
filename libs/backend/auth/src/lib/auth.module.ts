import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '@restaurant-os/database';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
