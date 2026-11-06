

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Module,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import {
  IsArray,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { PrismaService } from '../database/database.module';
import { JwtAuthGuard } from '../auth/auth.module';
import PDFDocument from 'pdfkit';
import { Mailer } from '../common/mailer';
import { checkCoupon } from '../common/coupon';

class ItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

class CheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];

  @IsObject()
  address: Record<string, string>;

  @IsIn(['standard', 'express'])
  delivery: string;

  @IsOptional()
  @IsString()
  coupon?: string;

  @IsIn(['COD', 'JAZZCASH', 'EASYPAISA', 'PAYFAST', 'STRIPE'])
  method: string;
}

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private db: PrismaService,
    private mail: Mailer,
  ) {}

  @Post()
  async create(@Req() req: any, @Body() d: CheckoutDto) {
    if (d.method !== 'COD') {
      throw new BadRequestException(
        'Gateway not configured yet; use COD (see README)',
      );
    }

    const order = await this.db.$transaction(async (tx) => {
      let subtotal = 0;
      const lines = [];

      for (const it of d.items) {
        const p = await tx.product.findUnique({
          where: { id: it.productId },
        });

        if (!p || !p.published) {
          throw new BadRequestException('Invalid product');
        }

        const upd = await tx.product.updateMany({
          where: {
            id: p.id,
            stock: { gte: it.quantity },
          },
          data: {
            stock: { decrement: it.quantity },
          },
        });

        if (!upd.count) {
          throw new BadRequestException(
            `Insufficient stock: ${p.name}`,
          );
        }

        const unit = Number(p.salePrice ?? p.price);

        subtotal += unit * it.quantity;

        lines.push({
          productId: p.id,
          quantity: it.quantity,
          unitPrice: unit,
        });
      }

      let discount = 0;
      let couponCode: string | null = null;

      if (d.coupon) {
        const c = await checkCoupon(tx, d.coupon, subtotal);

        discount = c.discount;
        couponCode = c.code;

        await tx.coupon.update({
          where: { code: c.code },
          data: { used: { increment: 1 } },
        });
      }

      const shipping =
        d.delivery === 'express'
          ? 25
          : subtotal > 5000
            ? 0
            : 10;

      return tx.order.create({
        data: {
          userId: req.user.id,
          subtotal,
          shipping,
          discount,
          couponCode,
          total: subtotal - discount + shipping,
          address: d.address,

          items: {
            create: lines,
          },

          payment: {
            create: {
              method: 'COD',
              amount: subtotal - discount + shipping,
            },
          },
        },
        include: {
          items: true,
          payment: true,
        },
      });
    });

    // EMAIL NOTIFICATIONS

    const orderNumber = order.id.slice(-8);
    const total = `$${Number(order.total).toFixed(2)}`;

    const customerBody = `
      <p>Thank you, ${req.user.name}!</p>
      <p>Your MIRZA WATCHES order has been placed successfully.</p>
      <p>Order Number: <b>#${orderNumber}</b></p>
      <p>Total: <b>${total}</b></p>
      <p>Payment Method: ${d.method}</p>
      <p>We will contact you regarding your order soon.</p>
    `;

    const adminBody = `
      <p>A new order has been received!</p>
      <p>Customer: <b>${req.user.name}</b></p>
      <p>Customer Email: ${req.user.email}</p>
      <p>Order Number: <b>#${orderNumber}</b></p>
      <p>Total: <b>${total}</b></p>
      <p>Payment Method: ${d.method}</p>
    `;

    const emails = [
      this.mail.send(
        req.user.email,
        'Your MIRZA Order Confirmation',
        'Order Confirmed',
        customerBody,
      ),

      ...(process.env.ADMIN_EMAIL
        ? [
            this.mail.send(
              process.env.ADMIN_EMAIL,
              'New MIRZA Order Received',
              'New Order',
              adminBody,
            ),
          ]
        : []),
    ];

    // Email failure will not cancel an already-created order.
    const results = await Promise.allSettled(emails);

    results.forEach((result) => {
      if (result.status === 'rejected') {
        console.error('[MIRZA email error]', result.reason);
      }
    });

    return order;
  }

  @Get(':id/invoice')
  async invoice(
    @Req() req: any,
    @Param('id') id: string,
    @Res() res: any,
  ) {
    const o = await this.db.order.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
    });

    if (!o) {
      throw new NotFoundException();
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=MIRZA-${o.id.slice(-8)}.pdf`,
    );

    doc.pipe(res);

    doc
      .fillColor('#8D642D')
      .fontSize(26)
      .text('MIRZA WATCHES', { align: 'left' })
      .fontSize(9)
      .text('TIMELESS ELEGANCE. EXTRAORDINARY PRECISION.')
      .moveDown();

    doc
      .fillColor('#000')
      .fontSize(12)
      .text(`Invoice #${o.id.slice(-8)}`)
      .text(`Date: ${o.createdAt.toDateString()}`)
      .text(`Customer: ${req.user.name} (${req.user.email})`)
      .text(`Payment: ${o.payment?.method} / ${o.payment?.status}`)
      .moveDown();

    for (const i of o.items) {
      doc.text(
        `${i.product.name}  x${i.quantity}   $${(
          Number(i.unitPrice) * i.quantity
        ).toFixed(2)}`,
      );
    }

    doc
      .moveDown()
      .text(`Subtotal: $${o.subtotal}`)
      .text(`Discount: -$${o.discount}`)
      .text(`Shipping: $${o.shipping}`)
      .fontSize(14)
      .text(`TOTAL: $${o.total}`);

    doc.end();
  }

  @Get('mine')
  mine(@Req() req: any) {
    return this.db.order.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

@Module({
  controllers: [OrdersController],
})
export class OrdersModule {}
