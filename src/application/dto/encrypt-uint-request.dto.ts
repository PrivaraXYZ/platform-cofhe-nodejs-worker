import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Matches, Max, Min } from 'class-validator';
import { IsEthereumAddress } from './encrypt-request.dto';

export class EncryptUint8RequestDto {
  @ApiProperty({
    description: 'Uint8 value to encrypt (0-255)',
    example: 255,
    minimum: 0,
    maximum: 255,
  })
  @IsNumber()
  @Min(0)
  @Max(255)
  value!: number;

  @ApiProperty({
    description: 'User address for ZK signature binding',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsEthereumAddress()
  userAddress!: string;
}

export class EncryptUint16RequestDto {
  @ApiProperty({
    description: 'Uint16 value to encrypt (0-65535)',
    example: 65535,
    minimum: 0,
    maximum: 65535,
  })
  @IsNumber()
  @Min(0)
  @Max(65535)
  value!: number;

  @ApiProperty({
    description: 'User address for ZK signature binding',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsEthereumAddress()
  userAddress!: string;
}

export class EncryptUint32RequestDto {
  @ApiProperty({
    description: 'Uint32 value to encrypt (as string for large values)',
    example: '4294967295',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'Value must be a valid uint32 string' })
  value!: string;

  @ApiProperty({
    description: 'User address for ZK signature binding',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsEthereumAddress()
  userAddress!: string;
}

export class EncryptUint128RequestDto {
  @ApiProperty({
    description: 'Uint128 value to encrypt (as string for large values)',
    example: '340282366920938463463374607431768211455',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'Value must be a valid uint128 string' })
  value!: string;

  @ApiProperty({
    description: 'User address for ZK signature binding',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsEthereumAddress()
  userAddress!: string;
}

export class EncryptUint256RequestDto {
  @ApiProperty({
    description: 'Uint256 value to encrypt (as string for large values)',
    example: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'Value must be a valid uint256 string' })
  value!: string;

  @ApiProperty({
    description: 'User address for ZK signature binding',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsEthereumAddress()
  userAddress!: string;
}
