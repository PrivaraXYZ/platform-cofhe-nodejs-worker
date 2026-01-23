import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { IsEthereumAddress } from './encrypt-request.dto';

export class EncryptBoolRequestDto {
  @ApiProperty({
    description: 'Boolean value to encrypt',
    example: true,
  })
  @IsBoolean()
  value!: boolean;

  @ApiProperty({
    description: 'User address for ZK signature binding',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsEthereumAddress()
  userAddress!: string;
}
