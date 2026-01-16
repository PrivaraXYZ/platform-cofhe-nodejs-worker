import { Module } from '@nestjs/common';
import { FheWorkerPoolService } from './fhe-worker-pool.service';
import { FHE_SERVICE } from '@domain/fhe/service/fhe.service.interface';

@Module({
  providers: [
    FheWorkerPoolService,
    {
      provide: FHE_SERVICE,
      useExisting: FheWorkerPoolService,
    },
  ],
  exports: [FHE_SERVICE, FheWorkerPoolService],
})
export class FheModule {}
