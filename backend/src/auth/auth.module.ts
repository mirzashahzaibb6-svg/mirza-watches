import { Body, CanActivate, Controller, ExecutionContext, Get, Global, Injectable, Module, Post, Req, Res, SetMetadata, UnauthorizedException, ConflictException, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { Mailer } from '../common/mailer';
import { PrismaService } from '../database/database.module';

export class RegisterDto {
  @IsString() @MinLength(2) name: string;
  @IsEmail() email: string;
  @Matches(/^\+?[0-9]{10,14}$/, { message: 'Invalid phone number' }) phone: string;
  @IsString() @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/, { message: 'Password needs 8+ chars, upper, lower, digit' }) password: string;
}
export class LoginDto { @IsEmail() email: string; @IsString() password: string; }

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private db: PrismaService) {}
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const token = req.cookies?.mirza_at;
    if (!token) throw new UnauthorizedException('Please sign in to complete your purchase.');
    try {
      const p = await this.jwt.verifyAsync(token);
      const u = await this.db.user.findUnique({ where: { id: p.sub } });
      if (!u || u.blocked) throw new Error();
      req.user = u;
      return true;
    } catch { throw new UnauthorizedException('Session expired'); }
  }
}
export const Roles = (...r: string[]) => SetMetadata('roles', r);
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private ref: Reflector) {}
  canActivate(ctx: ExecutionContext) {
    const roles = this.ref.get<string[]>('roles', ctx.getHandler());
    return !roles || roles.includes(ctx.switchToHttp().getRequest().user?.role);
  }
}

@Controller('auth')
export class AuthController {
  constructor(private db: PrismaService, private jwt: JwtService, private mail: Mailer) {}
  private async sendVerify(u: any) {
    const raw = randomBytes(32).toString('hex');
    await this.db.emailToken.create({ data: { userId: u.id, tokenHash: createHash('sha256').update(raw).digest('hex'), expiresAt: new Date(Date.now() + 864e5) } });
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${raw}`;
    await this.mail.send(u.email, 'Verify your MIRZA account', `Welcome, ${u.name}`, `<p>Please verify your email:</p><p><a style="color:#E5B96B" href="${link}">${link}</a></p>`);
  }
  private async issue(res: any, u: any) {
    const token = await this.jwt.signAsync({ sub: u.id, role: u.role });
    res.cookie('mirza_at', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 864e5 });
    return { id: u.id, name: u.name, email: u.email, role: u.role };
  }
  @Post('register')
  async register(@Body() d: RegisterDto, @Res({ passthrough: true }) res: any) {
    if (await this.db.user.findUnique({ where: { email: d.email.toLowerCase() } })) throw new ConflictException('Email already registered');
    const u = await this.db.user.create({ data: { name: d.name, email: d.email.toLowerCase(), phone: d.phone, password: await bcrypt.hash(d.password, 12) } });
    this.sendVerify(u).catch(() => {});
    return this.issue(res, u);
  }
  @Post('login')
  async login(@Body() d: LoginDto, @Res({ passthrough: true }) res: any) {
    const u = await this.db.user.findUnique({ where: { email: d.email.toLowerCase() } });
    if (!u || !(await bcrypt.compare(d.password, u.password))) throw new UnauthorizedException('Invalid email or password');
    if (u.blocked) throw new UnauthorizedException('Account blocked');
    return this.issue(res, u);
  }
  @Post('verify')
  async verify(@Body() d: { token: string }) {
    const t = await this.db.emailToken.findUnique({ where: { tokenHash: createHash('sha256').update(String(d.token || '')).digest('hex') } });
    if (!t || t.expiresAt < new Date()) throw new UnauthorizedException('Link invalid or expired');
    await this.db.$transaction([this.db.user.update({ where: { id: t.userId }, data: { verified: true } }), this.db.emailToken.delete({ where: { id: t.id } })]);
    return { ok: true };
  }
  @Post('resend-verification') @UseGuards(JwtAuthGuard)
  async resend(@Req() req: any) { if (!req.user.verified) await this.sendVerify(req.user); return { ok: true }; }
  @Post('logout')
  logout(@Res({ passthrough: true }) res: any) { res.clearCookie('mirza_at'); return { ok: true }; }
  @Get('me') @UseGuards(JwtAuthGuard)
  me(@Req() req: any) { const { id, name, email, role } = req.user; return { id, name, email, role }; }
}

@Global()
@Module({
  imports: [JwtModule.register({ global: true, secret: process.env.JWT_SECRET || 'dev-secret', signOptions: { expiresIn: '7d' } })],
  controllers: [AuthController], providers: [JwtAuthGuard, RolesGuard], exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
