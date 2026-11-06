import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DbModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { ExtrasModule } from './extras/extras.module';

@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 300 }]), DbModule, AuthModule, ProductsModule, OrdersModule, AdminModule, ExtrasModule],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
