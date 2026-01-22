import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export const ETHEREUM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export function IsEthereumAddress(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEthereumAddress',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `${propertyName} must be a valid Ethereum address`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && ETHEREUM_ADDRESS_REGEX.test(value);
        },
      },
    });
  };
}

export function IsValidEncryptValue(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidEncryptValue',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const obj = args.object as { type?: EncryptionTypeDto };
          if (obj.type === EncryptionTypeDto.BOOL) {
            return typeof value === 'boolean';
          }
          if (obj.type === EncryptionTypeDto.ADDRESS) {
            return typeof value === 'string' && ETHEREUM_ADDRESS_REGEX.test(value);
          }
          return (typeof value === 'string' && value.length > 0) || typeof value === 'number';
        },
        defaultMessage(args: ValidationArguments) {
          const obj = args.object as { type?: EncryptionTypeDto };
          if (obj.type === EncryptionTypeDto.BOOL) {
            return 'value must be a boolean when type is ebool';
          }
          if (obj.type === EncryptionTypeDto.ADDRESS) {
            return 'value must be a valid Ethereum address when type is eaddress';
          }
          return 'value must be a non-empty string or number for uint types';
        },
      },
    });
  };
}

export enum EncryptionTypeDto {
  UINT8 = 'euint8',
  UINT16 = 'euint16',
  UINT32 = 'euint32',
  UINT64 = 'euint64',
  UINT128 = 'euint128',
  UINT256 = 'euint256',
  ADDRESS = 'eaddress',
  BOOL = 'ebool',
}

export class EncryptRequestDto {
  @ApiProperty({
    description: 'Type of value to encrypt',
    enum: EncryptionTypeDto,
    example: EncryptionTypeDto.UINT64,
  })
  @IsEnum(EncryptionTypeDto)
  type!: EncryptionTypeDto;

  @ApiProperty({
    description:
      'Value to encrypt (string/number for uint types, Ethereum address for eaddress, boolean for ebool)',
    oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }],
    examples: {
      uint8: { value: 255, summary: 'uint8 value' },
      uint16: { value: 65535, summary: 'uint16 value' },
      uint32: { value: '4294967295', summary: 'uint32 value as string' },
      uint64: { value: '1000000', summary: 'uint64 value as string' },
      uint128: { value: '340282366920938463463374607431768211455', summary: 'uint128 value' },
      uint256: {
        value: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
        summary: 'uint256 value',
      },
      address: { value: '0x1234567890123456789012345678901234567890', summary: 'Ethereum address' },
      bool: { value: true, summary: 'Boolean value' },
    },
  })
  @IsValidEncryptValue()
  value!: string | number | boolean;

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
