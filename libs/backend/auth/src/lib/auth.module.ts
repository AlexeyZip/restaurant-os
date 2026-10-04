import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '@restaurant-os/database';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  controllers: [AuthController],
  exports: [JwtAuthGuard, JwtStrategy, RolesGuard, JwtModule],
})
export class AuthModule {}
