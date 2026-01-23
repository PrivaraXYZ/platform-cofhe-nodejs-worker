import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { EncryptionTypeDto, IsEthereumAddress, IsValidEncryptValue } from './encrypt-request.dto';

export class BatchItemDto {
  @ApiProperty({
    description: 'Type of value to encrypt',
    enum: EncryptionTypeDto,
    enumName: 'EncryptionType',
    example: 'euint64',
  })
  @IsEnum(EncryptionTypeDto)
  type!: EncryptionTypeDto;

  @ApiProperty({
    description:
      'Value to encrypt. String/number for uint types, Ethereum address for eaddress, boolean for ebool.',
    oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }],
    examples: ['1000000', '0xabcdef...', true, 255],
  })
  @IsValidEncryptValue()
  value!: string | number | boolean;
}

export class EncryptBatchRequestDto {
  @ApiProperty({
    description: 'User address for ZK signature binding',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsEthereumAddress()
  userAddress!: string;

  @ApiProperty({
    description: 'Array of items to encrypt. Maximum 10 items per batch.',
    type: [BatchItemDto],
    minItems: 1,
    maxItems: 10,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => BatchItemDto)
  items!: BatchItemDto[];
}
