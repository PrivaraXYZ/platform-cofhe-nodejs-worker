import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { IsEthereumAddress } from './encrypt-request.dto';

export class EncryptAddressRequestDto {
  @ApiProperty({
    description: 'Ethereum address to encrypt',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsNotEmpty()
  @IsEthereumAddress()
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
