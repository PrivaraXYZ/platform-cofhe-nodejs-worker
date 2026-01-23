import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { EncryptRequestDto, EncryptionTypeDto } from '@application/dto/encrypt-request.dto';
import { EncryptUint64RequestDto } from '@application/dto/encrypt-uint64-request.dto';
import {
  EncryptUint8RequestDto,
  EncryptUint16RequestDto,
  EncryptUint32RequestDto,
  EncryptUint128RequestDto,
  EncryptUint256RequestDto,
} from '@application/dto/encrypt-uint-request.dto';
import { EncryptAddressRequestDto } from '@application/dto/encrypt-address-request.dto';
import { EncryptBoolRequestDto } from '@application/dto/encrypt-bool-request.dto';

describe('DTO Validation', () => {
  const validUserAddress = '0xabcdef0123456789abcdef0123456789abcdef01';

  describe('EncryptRequestDto', () => {
    it('should pass validation for valid uint64 request with userAddress', async () => {
      const dto = plainToInstance(EncryptRequestDto, {
        type: EncryptionTypeDto.UINT64,
        value: '1000000',
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation for request without userAddress', async () => {
      const dto = plainToInstance(EncryptRequestDto, {
        type: EncryptionTypeDto.UINT64,
        value: '1000000',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'userAddress')).toBe(true);
    });

    it('should pass validation for valid address request', async () => {
      const dto = plainToInstance(EncryptRequestDto, {
        type: EncryptionTypeDto.ADDRESS,
        value: validUserAddress,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation for valid bool request', async () => {
      const dto = plainToInstance(EncryptRequestDto, {
        type: EncryptionTypeDto.BOOL,
        value: true,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation for all encryption types', async () => {
      const testCases = [
        { type: EncryptionTypeDto.UINT8, value: 100 },
        { type: EncryptionTypeDto.UINT16, value: 1000 },
        { type: EncryptionTypeDto.UINT32, value: '1000' },
        { type: EncryptionTypeDto.UINT64, value: '1000' },
        { type: EncryptionTypeDto.UINT128, value: '1000' },
        { type: EncryptionTypeDto.UINT256, value: '1000' },
        { type: EncryptionTypeDto.ADDRESS, value: '0x1234567890123456789012345678901234567890' },
        { type: EncryptionTypeDto.BOOL, value: true },
      ];

      for (const { type, value } of testCases) {
        const dto = plainToInstance(EncryptRequestDto, {
          type,
          value,
          userAddress: validUserAddress,
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should fail validation for invalid type', async () => {
      const dto = plainToInstance(EncryptRequestDto, {
        type: 'invalid',
        value: '1000',
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('type');
    });

    it('should fail validation for invalid user address', async () => {
      const dto = plainToInstance(EncryptRequestDto, {
        type: EncryptionTypeDto.UINT64,
        value: '1000',
        userAddress: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'userAddress')).toBe(true);
    });
  });

  describe('EncryptUint8RequestDto', () => {
    it('should pass validation for valid request with userAddress', async () => {
      const dto = plainToInstance(EncryptUint8RequestDto, {
        value: 255,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation for request without userAddress', async () => {
      const dto = plainToInstance(EncryptUint8RequestDto, {
        value: 100,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'userAddress')).toBe(true);
    });

    it('should fail validation for value over 255', async () => {
      const dto = plainToInstance(EncryptUint8RequestDto, {
        value: 256,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation for negative value', async () => {
      const dto = plainToInstance(EncryptUint8RequestDto, {
        value: -1,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('EncryptUint16RequestDto', () => {
    it('should pass validation for valid request', async () => {
      const dto = plainToInstance(EncryptUint16RequestDto, {
        value: 65535,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation for value over 65535', async () => {
      const dto = plainToInstance(EncryptUint16RequestDto, {
        value: 65536,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('EncryptUint32RequestDto', () => {
    it('should pass validation for valid request', async () => {
      const dto = plainToInstance(EncryptUint32RequestDto, {
        value: '4294967295',
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation for non-numeric value', async () => {
      const dto = plainToInstance(EncryptUint32RequestDto, {
        value: 'abc',
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('EncryptUint64RequestDto', () => {
    it('should pass validation for valid request with userAddress', async () => {
      const dto = plainToInstance(EncryptUint64RequestDto, {
        value: '1000000',
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation for request without userAddress', async () => {
      const dto = plainToInstance(EncryptUint64RequestDto, {
        value: '1000000',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'userAddress')).toBe(true);
    });

    it('should fail validation for non-numeric value', async () => {
      const dto = plainToInstance(EncryptUint64RequestDto, {
        value: 'abc',
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('value');
    });

    it('should fail validation for empty value', async () => {
      const dto = plainToInstance(EncryptUint64RequestDto, {
        value: '',
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('EncryptUint128RequestDto', () => {
    it('should pass validation for valid request', async () => {
      const dto = plainToInstance(EncryptUint128RequestDto, {
        value: '340282366920938463463374607431768211455',
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation for non-numeric value', async () => {
      const dto = plainToInstance(EncryptUint128RequestDto, {
        value: 'abc',
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('EncryptUint256RequestDto', () => {
    it('should pass validation for valid request', async () => {
      const dto = plainToInstance(EncryptUint256RequestDto, {
        value: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation for non-numeric value', async () => {
      const dto = plainToInstance(EncryptUint256RequestDto, {
        value: 'xyz',
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('EncryptAddressRequestDto', () => {
    it('should pass validation for valid request with userAddress', async () => {
      const dto = plainToInstance(EncryptAddressRequestDto, {
        value: validUserAddress,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation for request without userAddress', async () => {
      const dto = plainToInstance(EncryptAddressRequestDto, {
        value: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'userAddress')).toBe(true);
    });

    it('should fail validation for invalid value address', async () => {
      const dto = plainToInstance(EncryptAddressRequestDto, {
        value: 'invalid',
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('value');
    });
  });

  describe('EncryptBoolRequestDto', () => {
    it('should pass validation for true value with userAddress', async () => {
      const dto = plainToInstance(EncryptBoolRequestDto, {
        value: true,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation for false value', async () => {
      const dto = plainToInstance(EncryptBoolRequestDto, {
        value: false,
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation for non-boolean value', async () => {
      const dto = plainToInstance(EncryptBoolRequestDto, {
        value: 'true',
        userAddress: validUserAddress,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
