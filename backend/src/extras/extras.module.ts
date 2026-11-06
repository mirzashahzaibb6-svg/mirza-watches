import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, Module, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IsEmail } from 'class-validator';
import { PrismaService } from '../database/database.module';
import { JwtAuthGuard } from '../auth/auth.module';
import { AdminGuard } from '../admin/admin.module';
import { checkCoupon } from '../common/coupon';
class MailDto { @IsEmail() email: string; }
@Controller()
export class ExtrasController {
  constructor(private db: PrismaService) {}
  // wishlist
  @Get('wishlist') @UseGuards(JwtAuthGuard) wl(@Req() r: any) { return this.db.wishlist.findMany({ where: { userId: r.user.id }, include: { product: true } }); }
  @Post('wishlist/:pid') @UseGuards(JwtAuthGuard) addWl(@Req() r: any, @Param('pid') pid: string) {
    return this.db.wishlist.upsert({ where: { userId_productId: { userId: r.user.id, productId: pid } }, update: {}, create: { userId: r.user.id, productId: pid } });
  }
  @Delete('wishlist/:pid') @UseGuards(JwtAuthGuard) async rmWl(@Req() r: any, @Param('pid') pid: string) { await this.db.wishlist.deleteMany({ where: { userId: r.user.id, productId: pid } }); return { ok: true }; }
  // reviews (approved only are public; buyers only)
  @Get('products/:id/reviews') reviews(@Param('id') id: string) { return this.db.review.findMany({ where: { productId: id, approved: true }, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }); }
  @Post('products/:id/reviews') @UseGuards(JwtAuthGuard)
  async addReview(@Req() r: any, @Param('id') id: string, @Body() d: any) {
    if (!(+d.rating >= 1 && +d.rating <= 5) || !d.title || !d.body) throw new BadRequestException('Rating (1-5), title and review text required');
    if (!(await this.db.orderItem.findFirst({ where: { productId: id, order: { userId: r.user.id } } }))) throw new ForbiddenException('Only customers who bought this watch can review it');
    return this.db.review.upsert({ where: { userId_productId: { userId: r.user.id, productId: id } }, update: { rating: +d.rating, title: d.title, body: d.body, approved: false }, create: { userId: r.user.id, productId: id, rating: +d.rating, title: d.title, body: d.body } });
  }
  // coupons + newsletter
  @Post('coupons/validate') validate(@Body() d: { code: string; subtotal: number }) { return checkCoupon(this.db, d.code || '', +d.subtotal || 0); }
  @Post('newsletter') async news(@Body() d: MailDto) { await this.db.newsletterSubscriber.upsert({ where: { email: d.email.toLowerCase() }, update: {}, create: { email: d.email.toLowerCase() } }); return { ok: true }; }
  // admin moderation + coupons
  @Get('admin/reviews') @UseGuards(JwtAuthGuard, AdminGuard) allReviews() { return this.db.review.findMany({ orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } }, product: { select: { name: true } } } }); }
  @Patch('admin/reviews/:id') @UseGuards(JwtAuthGuard, AdminGuard)
  async moderate(@Param('id') id: string, @Body() d: { approved: boolean }) {
    const rv = await this.db.review.update({ where: { id }, data: { approved: !!d.approved } });
    const agg = await this.db.review.aggregate({ where: { productId: rv.productId, approved: true }, _avg: { rating: true }, _count: true });
    await this.db.product.update({ where: { id: rv.productId }, data: { rating: agg._avg.rating ?? 4.8, reviewCount: agg._count } });
    return rv;
  }
  @Get('admin/coupons') @UseGuards(JwtAuthGuard, AdminGuard) coupons() { return this.db.coupon.findMany({ orderBy: { code: 'asc' } }); }
  @Post('admin/coupons') @UseGuards(JwtAuthGuard, AdminGuard)
  createCoupon(@Body() d: any) {
    if (!d.code || !(+d.value > 0) || !['PERCENT', 'FIXED'].includes(d.type)) throw new BadRequestException('code, type and value required');
    return this.db.coupon.create({ data: { code: String(d.code).toUpperCase(), type: d.type, value: +d.value, minOrder: +d.minOrder || 0, maxUses: d.maxUses ? +d.maxUses : null } });
  }
  @Patch('admin/coupons/:id') @UseGuards(JwtAuthGuard, AdminGuard) toggle(@Param('id') id: string, @Body() d: { active: boolean }) { return this.db.coupon.update({ where: { id }, data: { active: !!d.active } }); }
}
@Module({ controllers: [ExtrasController] })
export class ExtrasModule {}
