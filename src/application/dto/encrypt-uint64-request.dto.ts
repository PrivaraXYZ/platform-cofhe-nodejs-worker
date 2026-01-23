import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';
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

  @ApiProperty({
    description: 'User address for ZK signature binding',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsEthereumAddress()
  userAddress!: string;
}
