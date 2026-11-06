import { Controller, Get, Module, Param, Query, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/database.module';
@Controller()
export class ProductsController {
  constructor(private db: PrismaService) {}
  @Get('products')
  async list(@Query() q: any) {
    const page = Math.max(+q.page || 1, 1), take = Math.min(+q.limit || 12, 50);
    const where: any = { published: true };
    if (q.search) where.OR = [{ name: { contains: q.search, mode: 'insensitive' } }, { sku: { contains: q.search, mode: 'insensitive' } }];
    if (q.collection) where.collection = { slug: q.collection };
    if (q.featured === 'true') where.featured = true;
    if (q.gender) where.gender = q.gender;
    const orderBy = { price_asc: { price: 'asc' }, price_desc: { price: 'desc' }, rating: { rating: 'desc' } }[q.sort as string] || { createdAt: 'desc' };
    const [items, total] = await Promise.all([
      this.db.product.findMany({ where, orderBy: orderBy as any, skip: (page - 1) * take, take }),
      this.db.product.count({ where }),
    ]);
    return { items, total, page };
  }
  @Get('products/:slug')
  async one(@Param('slug') slug: string) {
    const p = await this.db.product.findUnique({ where: { slug }, include: { collection: true } });
    if (!p) throw new NotFoundException(); return p;
  }
  @Get('collections') collections() { return this.db.collection.findMany(); }
}
@Module({ controllers: [ProductsController] })
export class ProductsModule {}
