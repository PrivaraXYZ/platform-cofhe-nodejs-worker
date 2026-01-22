import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EncryptionTypeDto } from './encrypt-request.dto';

export class EncryptedValueResponseDto {
  @ApiProperty({
    description: 'Type of encrypted value',
    enum: EncryptionTypeDto,
    enumName: 'EncryptionType',
    example: 'euint64',
  })
  type!: EncryptionTypeDto;

  @ApiProperty({
    description: 'Encrypted data — the ctHash to use in smart contract calls.',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    pattern: '^0x[a-fA-F0-9]+$',
  })
  data!: string;

  @ApiProperty({
    description: 'Security zone for the encrypted value.',
    example: 0,
    minimum: 0,
    maximum: 255,
  })
  securityZone!: number;

  @ApiProperty({
    description: 'FHE type identifier (5=euint64, 7=eaddress, etc).',
    example: 5,
    minimum: 0,
    maximum: 255,
  })
  utype!: number;

  @ApiProperty({
    description: 'Input proof — cryptographic signature for the encryption.',
    example: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    pattern: '^0x[a-fA-F0-9]+$',
  })
  inputProof!: string;

  @ApiPropertyOptional({
    description: 'Contract address used for encryption context (if provided)',
    example: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
    pattern: '^0x[a-fA-F0-9]{40}$',
  })
  contractAddress?: string;

  @ApiPropertyOptional({
    description: 'User address used for encryption context (if provided)',
    example: '0x1234567890123456789012345678901234567890',
    pattern: '^0x[a-fA-F0-9]{40}$',
  })
  userAddress?: string;

  @ApiProperty({
    description: 'Time taken for encryption in milliseconds',
    example: 2350,
    minimum: 0,
  })
  encryptionTimeMs!: number;
}
