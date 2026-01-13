import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { IsEthereumAddress } from './encrypt-request.dto';

export class EncryptBoolRequestDto {
  @ApiProperty({
    description: 'Boolean value to encrypt',
    example: true,
  })
  @IsBoolean()
  value!: boolean;

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
