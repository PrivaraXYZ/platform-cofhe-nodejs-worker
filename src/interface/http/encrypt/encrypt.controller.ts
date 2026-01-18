import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiExtraModels } from '@nestjs/swagger';
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
import { EncryptedValueResponseDto } from '@application/dto/encrypted-value-response.dto';
import { EncryptBatchRequestDto } from '@application/dto/encrypt-batch-request.dto';
import { EncryptBatchResponseDto } from '@application/dto/encrypt-batch-response.dto';
import { ErrorResponseDto } from '@application/dto/error-response.dto';
import { EncryptUseCase } from '@application/use-case/encrypt.use-case';
import { BatchEncryptUseCase } from '@application/use-case/encrypt-batch.use-case';
import { BatchValidationError } from '@domain/fhe/error/fhe.error';

@ApiTags('Encrypt')
@ApiExtraModels(EncryptedValueResponseDto, EncryptBatchResponseDto, ErrorResponseDto)
@Controller('api/v1/encrypt')
export class EncryptController {
  constructor(
    private readonly encryptUseCase: EncryptUseCase,
    private readonly batchEncryptUseCase: BatchEncryptUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encrypt a value (generic endpoint)',
    description: `Universal encryption endpoint supporting all types.

Use this when you need to dynamically choose the encryption type at runtime.
For better type safety, prefer the typed endpoints.

**Supported Types:** euint8, euint16, euint32, euint64, euint128, euint256, eaddress, ebool`,
  })
  @ApiBody({ type: EncryptRequestDto })
  @ApiResponse({ status: 200, description: 'Value encrypted successfully', type: EncryptedValueResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponseDto })
  @ApiResponse({ status: 422, description: 'Invalid address or value', type: ErrorResponseDto })
  @ApiResponse({ status: 500, description: 'Encryption failed', type: ErrorResponseDto })
  @ApiResponse({ status: 503, description: 'Service not ready', type: ErrorResponseDto })
  @ApiResponse({ status: 504, description: 'Encryption timeout', type: ErrorResponseDto })
  async encrypt(@Body() dto: EncryptRequestDto): Promise<EncryptedValueResponseDto> {
    const result = await this.encryptUseCase.execute({
      type: dto.type,
      value: dto.value,
      contractAddress: dto.contractAddress,
      userAddress: dto.userAddress,
    });

    if (!result.ok) throw result.error;

    return result.value as EncryptedValueResponseDto;
  }

  @Post('uint8')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encrypt a uint8 value',
    description: `Encrypts an 8-bit unsigned integer (0-255).

**Use Cases:** Small counters, flags, status codes`,
  })
  @ApiBody({ type: EncryptUint8RequestDto })
  @ApiResponse({ status: 200, description: 'Value encrypted successfully', type: EncryptedValueResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponseDto })
  async encryptUint8(@Body() dto: EncryptUint8RequestDto): Promise<EncryptedValueResponseDto> {
    const result = await this.encryptUseCase.execute({
      type: EncryptionTypeDto.UINT8,
      value: dto.value,
      contractAddress: dto.contractAddress,
      userAddress: dto.userAddress,
    });

    if (!result.ok) throw result.error;

    return result.value as EncryptedValueResponseDto;
  }

  @Post('uint16')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encrypt a uint16 value',
    description: `Encrypts a 16-bit unsigned integer (0-65535).

**Use Cases:** Medium-size counters, indexes`,
  })
  @ApiBody({ type: EncryptUint16RequestDto })
  @ApiResponse({ status: 200, description: 'Value encrypted successfully', type: EncryptedValueResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponseDto })
  async encryptUint16(@Body() dto: EncryptUint16RequestDto): Promise<EncryptedValueResponseDto> {
    const result = await this.encryptUseCase.execute({
      type: EncryptionTypeDto.UINT16,
      value: dto.value,
      contractAddress: dto.contractAddress,
      userAddress: dto.userAddress,
    });

    if (!result.ok) throw result.error;

    return result.value as EncryptedValueResponseDto;
  }

  @Post('uint32')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encrypt a uint32 value',
    description: `Encrypts a 32-bit unsigned integer (0-4,294,967,295).

**Use Cases:** Timestamps, medium-range values`,
  })
  @ApiBody({ type: EncryptUint32RequestDto })
  @ApiResponse({ status: 200, description: 'Value encrypted successfully', type: EncryptedValueResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponseDto })
  async encryptUint32(@Body() dto: EncryptUint32RequestDto): Promise<EncryptedValueResponseDto> {
    const result = await this.encryptUseCase.execute({
      type: EncryptionTypeDto.UINT32,
      value: dto.value,
      contractAddress: dto.contractAddress,
      userAddress: dto.userAddress,
    });

    if (!result.ok) throw result.error;

    return result.value as EncryptedValueResponseDto;
  }

  @Post('uint64')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encrypt a uint64 value',
    description: `Encrypts a 64-bit unsigned integer.

**Value Range:** 0 to 18,446,744,073,709,551,615

**Use Cases:** Token amounts, balances, timestamps`,
  })
  @ApiBody({ type: EncryptUint64RequestDto })
  @ApiResponse({ status: 200, description: 'Value encrypted successfully', type: EncryptedValueResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponseDto })
  async encryptUint64(@Body() dto: EncryptUint64RequestDto): Promise<EncryptedValueResponseDto> {
    const result = await this.encryptUseCase.execute({
      type: EncryptionTypeDto.UINT64,
      value: dto.value,
      contractAddress: dto.contractAddress,
      userAddress: dto.userAddress,
    });

    if (!result.ok) throw result.error;

    return result.value as EncryptedValueResponseDto;
  }

  @Post('uint128')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encrypt a uint128 value',
    description: `Encrypts a 128-bit unsigned integer.

**Use Cases:** Very large numeric values, UUIDs`,
  })
  @ApiBody({ type: EncryptUint128RequestDto })
  @ApiResponse({ status: 200, description: 'Value encrypted successfully', type: EncryptedValueResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponseDto })
  async encryptUint128(@Body() dto: EncryptUint128RequestDto): Promise<EncryptedValueResponseDto> {
    const result = await this.encryptUseCase.execute({
      type: EncryptionTypeDto.UINT128,
      value: dto.value,
      contractAddress: dto.contractAddress,
      userAddress: dto.userAddress,
    });

    if (!result.ok) throw result.error;

    return result.value as EncryptedValueResponseDto;
  }

  @Post('uint256')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encrypt a uint256 value',
    description: `Encrypts a 256-bit unsigned integer.

**Use Cases:** Hashes, cryptographic values, maximum precision numerics`,
  })
  @ApiBody({ type: EncryptUint256RequestDto })
  @ApiResponse({ status: 200, description: 'Value encrypted successfully', type: EncryptedValueResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponseDto })
  async encryptUint256(@Body() dto: EncryptUint256RequestDto): Promise<EncryptedValueResponseDto> {
    const result = await this.encryptUseCase.execute({
      type: EncryptionTypeDto.UINT256,
      value: dto.value,
      contractAddress: dto.contractAddress,
      userAddress: dto.userAddress,
    });

    if (!result.ok) throw result.error;

    return result.value as EncryptedValueResponseDto;
  }

  @Post('address')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encrypt an Ethereum address',
    description: `Encrypts an Ethereum address (20 bytes).

**Format:** 0x followed by 40 hexadecimal characters

**Use Cases:** Private recipient addresses, hidden counterparties`,
  })
  @ApiBody({ type: EncryptAddressRequestDto })
  @ApiResponse({ status: 200, description: 'Value encrypted successfully', type: EncryptedValueResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponseDto })
  async encryptAddress(@Body() dto: EncryptAddressRequestDto): Promise<EncryptedValueResponseDto> {
    const result = await this.encryptUseCase.execute({
      type: EncryptionTypeDto.ADDRESS,
      value: dto.value,
      contractAddress: dto.contractAddress,
      userAddress: dto.userAddress,
    });

    if (!result.ok) throw result.error;

    return result.value as EncryptedValueResponseDto;
  }

  @Post('bool')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encrypt a boolean value',
    description: `Encrypts a boolean value (true/false).

**Use Cases:** Private voting, confidential flags, secret binary choices`,
  })
  @ApiBody({ type: EncryptBoolRequestDto })
  @ApiResponse({ status: 200, description: 'Value encrypted successfully', type: EncryptedValueResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponseDto })
  async encryptBool(@Body() dto: EncryptBoolRequestDto): Promise<EncryptedValueResponseDto> {
    const result = await this.encryptUseCase.execute({
      type: EncryptionTypeDto.BOOL,
      value: dto.value,
      contractAddress: dto.contractAddress,
      userAddress: dto.userAddress,
    });

    if (!result.ok) throw result.error;

    return result.value as EncryptedValueResponseDto;
  }

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encrypt multiple values in batch',
    description: `Encrypts multiple values in a single request (max 10 items).

All-or-nothing semantics — if any item fails, the entire batch fails.`,
  })
  @ApiBody({ type: EncryptBatchRequestDto })
  @ApiResponse({ status: 200, description: 'All values encrypted successfully', type: EncryptBatchResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponseDto })
  @ApiResponse({ status: 422, description: 'Invalid address or value', type: ErrorResponseDto })
  @ApiResponse({ status: 500, description: 'Encryption failed', type: ErrorResponseDto })
  @ApiResponse({ status: 503, description: 'Service not ready', type: ErrorResponseDto })
  @ApiResponse({ status: 504, description: 'Encryption timeout', type: ErrorResponseDto })
  async encryptBatch(@Body() dto: EncryptBatchRequestDto): Promise<EncryptBatchResponseDto> {
    const result = await this.batchEncryptUseCase.execute({
      contractAddress: dto.contractAddress,
      userAddress: dto.userAddress,
      items: dto.items.map((item) => ({
        type: item.type,
        value: item.value,
        contractAddress: item.contractAddress,
        userAddress: item.userAddress,
      })),
    });

    if (!result.ok) {
      if (result.error instanceof BatchValidationError) {
        throw new BadRequestException(result.error.message);
      }
      throw result.error;
    }

    return result.value as EncryptBatchResponseDto;
  }
}
