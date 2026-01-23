import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsEthereumAddress } from './encrypt-request.dto';

export class EncryptAddressRequestDto {
  @ApiProperty({
    description: 'Ethereum address to encrypt',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsNotEmpty()
  @IsEthereumAddress()
  value!: string;

  @ApiProperty({
    description: 'User address for ZK signature binding',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsEthereumAddress()
  userAddress!: string;
}
