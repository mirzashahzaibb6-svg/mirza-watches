import { BadRequestException, Body, CanActivate, Controller, Delete, ExecutionContext, Get, Injectable, Module, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from '../database/database.module';
import { Mailer } from '../common/mailer';
import { JwtAuthGuard } from '../auth/auth.module';
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(c: ExecutionContext) { return ['ADMIN', 'SUPER_ADMIN'].includes(c.switchToHttp().getRequest().user?.role); }
}
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard) // every admin route enforced server-side
export class AdminController {
  constructor(private db: PrismaService, private mail: Mailer) {}
  @Get('stats') async stats() {
    const [revenue, orders, customers, products, pending, delivered, lowStock, recent] = await Promise.all([
      this.db.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
      this.db.order.count(), this.db.user.count({ where: { role: 'CUSTOMER' } }), this.db.product.count(),
      this.db.order.count({ where: { status: 'PENDING' } }), this.db.order.count({ where: { status: 'DELIVERED' } }),
      this.db.product.count({ where: { stock: { lte: 3 } } }),
      this.db.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } }),
    ]);
    return { revenue: revenue._sum.amount ?? 0, orders, customers, products, pending, delivered, lowStock, recent };
  }
  @Get('products') products() { return this.db.product.findMany({ orderBy: { createdAt: 'desc' } }); }
  @Post('products') create(@Body() d: any) {
    if (!d.name || !d.sku || !(+d.price > 0)) throw new BadRequestException('name, sku and price are required');
    return this.db.product.create({ data: { name: d.name, slug: slugify(d.name), sku: d.sku, description: d.description || '', price: +d.price,
      salePrice: d.salePrice ? +d.salePrice : null, stock: +d.stock || 0, gender: d.gender || 'MEN', images: d.images?.length ? d.images : ['/images/prod-1.jpg'],
      specs: d.specs || {}, collectionId: d.collectionId || null, featured: !!d.featured } });
  }
  @Patch('products/:id') update(@Param('id') id: string, @Body() d: any) {
    const data: any = {};
    for (const k of ['name', 'description', 'gender', 'featured', 'published', 'collectionId']) if (k in d) data[k] = d[k];
    for (const k of ['price', 'salePrice', 'stock']) if (k in d) data[k] = d[k] === null || d[k] === '' ? null : +d[k];
    return this.db.product.update({ where: { id }, data });
  }
  @Delete('products/:id') remove(@Param('id') id: string) { return this.db.product.update({ where: { id }, data: { published: false } }); } // soft delete
  @Get('orders') orders() { return this.db.order.findMany({ orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true, email: true } }, items: { include: { product: true } }, payment: true } }); }
  @Patch('orders/:id/status') async status(@Param('id') id: string, @Body() d: { status: any }) {
    const o = await this.db.order.update({ where: { id }, data: { status: d.status }, include: { user: true } });
    this.mail.send(o.user.email, `MIRZA order ${d.status}`, 'Order update', `<p>Your order #${o.id.slice(-8)} is now <b>${d.status}</b>.</p>`).catch(() => {});
    return o;
  }
  @Patch('orders/:id/payment') pay(@Param('id') id: string, @Body() d: { status: any }) { return this.db.payment.update({ where: { orderId: id }, data: { status: d.status } }); }
  @Get('customers') customers() { return this.db.user.findMany({ where: { role: 'CUSTOMER' }, select: { id: true, name: true, email: true, phone: true, blocked: true, createdAt: true, _count: { select: { orders: true } } } }); }
  @Patch('customers/:id/block') block(@Param('id') id: string, @Body() d: { blocked: boolean }) { return this.db.user.update({ where: { id }, data: { blocked: !!d.blocked } }); }
}
@Module({ controllers: [AdminController], providers: [AdminGuard] })
export class AdminModule {}
