import { join } from 'path';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CommonModule } from './common/common.module';
import { FilesModule } from './files/files.module';
import { ProductsModule } from './products/products.module';
import { SeedModule } from './seed/seed.module';
import { AuthModule } from './auth/auth.module';
import { MessageWsModule } from './message-ws/message-ws.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    // Limita peticiones por IP para prevenir fuerza bruta y ataques DoS.
    // short: máximo 10 peticiones cada 1 segundo por IP.
    // long: máximo 100 peticiones cada 60 segundos por IP.
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),

    TypeOrmModule.forRoot({
      ssl: process.env.STAGE === 'prod' || process.env.DB_SSL === 'true',
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT ?? '5432'),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      schema: (process.env.DB_SCHEMA ?? 'public'),

      autoLoadEntities: true,
      synchronize: false,

      migrationsTableName: 'migrations',
      migrations: [join(__dirname, 'migrations/*{.js,.ts}')],
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),

    ProductsModule,

    CommonModule,

    SeedModule,

    FilesModule,

    AuthModule,

    MessageWsModule,
  ],
  providers: [
    // Aplica el throttling globalmente a todos los endpoints de la aplicación.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

