import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EncryptionTypeDto } from './encrypt-request.dto';

/**
 * Response containing the encrypted value with data and input proof.
 *
 * The `data` is the encrypted ciphertext hash (ctHash).
 * The `inputProof` is cryptographic proof required to verify the encryption.
 */
export class EncryptedValueResponseDto {
  @ApiProperty({
    description: 'Type of encrypted value',
    enum: EncryptionTypeDto,
    enumName: 'EncryptionType',
    example: 'euint64',
  })
  type!: EncryptionTypeDto;

  @ApiProperty({
    description: 'Encrypted data — the ciphertext to use in smart contract calls.',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    pattern: '^0x[a-fA-F0-9]+$',
  })
  data!: string;

  @ApiProperty({
    description: 'Input proof — cryptographic proof for the encryption.',
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
