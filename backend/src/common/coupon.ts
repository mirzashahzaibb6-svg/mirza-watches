import { BadRequestException } from '@nestjs/common';
export async function checkCoupon(db: any, raw: string, subtotal: number) {
  const c = await db.coupon.findUnique({ where: { code: raw.trim().toUpperCase() } });
  if (!c || !c.active) throw new BadRequestException('Invalid coupon');
  if (c.expiresAt && c.expiresAt < new Date()) throw new BadRequestException('Coupon expired');
  if (c.maxUses != null && c.used >= c.maxUses) throw new BadRequestException('Coupon usage limit reached');
  if (subtotal < Number(c.minOrder)) throw new BadRequestException(`Minimum order $${c.minOrder}`);
  const v = Number(c.value), raw2 = c.type === 'PERCENT' ? (subtotal * v) / 100 : v;
  return { code: c.code, discount: Math.min(Math.round(raw2 * 100) / 100, subtotal) };
}
