import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import * as os from 'os';
import cofheConfig from '@infrastructure/config/fhe.config';
import workerConfig from '@infrastructure/config/worker.config';
import { FheModule } from '@infrastructure/fhe/fhe.module';
import { EncryptModule } from '@interface/http/encrypt/encrypt.module';
import { HealthModule } from '@interface/http/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [cofheConfig, workerConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),

        WORKER_MIN_THREADS: Joi.number().min(1).default(2),
        WORKER_MAX_THREADS: Joi.number().min(1).default(os.cpus().length),
        WORKER_IDLE_TIMEOUT: Joi.number().min(1000).default(60000),
        WORKER_MAX_QUEUE: Joi.number().min(1).default(100),
        WORKER_TASK_TIMEOUT: Joi.number().min(1000).default(45000),

        COFHE_CHAIN_ID: Joi.number().default(421614),
        COFHE_NETWORK_NAME: Joi.string().default('Arbitrum Sepolia'),
        COFHE_RPC_URL: Joi.string().default('https://sepolia-rollup.arbitrum.io/rpc'),
        COFHE_ENV: Joi.string().valid('mock', 'testnet').default('testnet'),
      }),
    }),
    FheModule,
    EncryptModule,
    HealthModule,
  ],
})
export class AppModule {}
