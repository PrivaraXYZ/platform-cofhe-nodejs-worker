import { Injectable, Logger } from '@nestjs/common';
import { Result, Ok } from '@domain/common/result';
import { FheDomainError, BatchValidationError } from '@domain/fhe/error/fhe.error';
import { EncryptionTypeDto } from '../dto/encrypt-request.dto';
import { EncryptUseCase, EncryptOutput } from './encrypt.use-case';

export interface BatchItem {
  type: EncryptionTypeDto;
  value: string | number | boolean;
}

export interface BatchEncryptInput {
  userAddress: string;
  items: BatchItem[];
}

export interface BatchEncryptOutput {
  results: EncryptOutput[];
  totalEncryptionTimeMs: number;
}

@Injectable()
export class BatchEncryptUseCase {
  private readonly logger = new Logger(BatchEncryptUseCase.name);

  constructor(private readonly encryptUseCase: EncryptUseCase) {}

  async execute(
    input: BatchEncryptInput,
  ): Promise<Result<BatchEncryptOutput, FheDomainError | BatchValidationError>> {
    const itemTypes = input.items.map((i) => i.type).join(', ');
    this.logger.debug(`Batch encryption started: ${input.items.length} items [${itemTypes}]`);

    const normalizedItems = this.normalizeItems(input);
    const startTime = Date.now();

    const encryptionResults = await Promise.all(
      normalizedItems.map((item, index) =>
        this.encryptUseCase.execute(item).then((result) => ({ result, index })),
      ),
    );

    const results: EncryptOutput[] = [];
    for (const { result, index } of encryptionResults) {
      if (!result.ok) {
        this.logger.warn(
          `Batch failed at item ${index}/${normalizedItems.length}: ${result.error.message}`,
        );
        return result;
      }
      results.push(result.value);
    }
    const totalTime = Date.now() - startTime;
    this.logger.debug(`Batch completed (parallel): ${results.length} items in ${totalTime}ms`);

    return Ok({
      results,
      totalEncryptionTimeMs: totalTime,
    });
  }

  private normalizeItems(input: BatchEncryptInput): Array<{
    type: EncryptionTypeDto;
    value: string | number | boolean;
    userAddress: string;
  }> {
    return input.items.map((item) => ({
      type: item.type,
      value: item.value,
      userAddress: input.userAddress,
    }));
  }
}
