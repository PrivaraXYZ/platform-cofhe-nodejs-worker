import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';
import { IsEthereumAddress } from './encrypt-request.dto';

export class EncryptUint64RequestDto {
  @ApiProperty({
    description: 'Uint64 value to encrypt (as string to handle large numbers)',
    example: '1000000',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'Value must be a valid uint64 string' })
  value!: string;

  @ApiPropertyOptional({
    description: 'Contract address for encryption context (optional for Fhenix)',
    example: '0xaBaC0e90FeBC5973D943D36351b9CE04A47bdB41',
  })
  @IsOptional()
  @IsEthereumAddress()
  contractAddress?: string;

  @ApiPropertyOptional({
    description: 'User address for encryption context (optional for Fhenix)',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsOptional()
  @IsEthereumAddress()
  userAddress?: string;
}
