import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import {
  successResponse,
  errorResponse,
  createApiHandler,
  validateRequest,
} from './api-utils';

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  },
}));

describe('api-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successResponse', () => {
    it('should return success response with correct structure', async () => {
      const response = successResponse('test data', 'Success message');
      const json = await response.json();

      expect(json).toEqual({
        code: '000000',
        msg: 'Success message',
        data: 'test data',
      });
    });

    it('should use default message when not provided', async () => {
      const response = successResponse('test data');
      const json = await response.json();

      expect(json.msg).toBe('调用成功');
    });
  });

  describe('errorResponse', () => {
    it('should return error response with correct structure', async () => {
      const response = errorResponse('Error message', '000002', 400);
      const json = await response.json();

      expect(json).toEqual({
        code: '000002',
        msg: 'Error message',
        data: null,
      });
      expect(response.status).toBe(400);
    });

    it('should use default values when not provided', async () => {
      const response = errorResponse();
      const json = await response.json();

      expect(json.code).toBe('000001');
      expect(json.msg).toBe('系统错误');
      expect(response.status).toBe(500);
    });
  });

  describe('createApiHandler', () => {
    it('should call handler and return success response on success', async () => {
      const mockHandler = vi.fn().mockResolvedValue('test result');
      const handler = createApiHandler(mockHandler);

      const req = {} as NextRequest;
      const response = await handler(req);
      const json = await response.json();

      expect(mockHandler).toHaveBeenCalledWith(req);
      expect(json.code).toBe('000000');
      expect(json.data).toBe('test result');
    });

    it('should return error response when handler throws', async () => {
      const mockHandler = vi.fn().mockRejectedValue(new Error('Test error'));
      const handler = createApiHandler(mockHandler);

      const req = {} as NextRequest;
      const response = await handler(req);
      const json = await response.json();

      expect(json.code).toBe('000001');
      expect(json.msg).toBe('Test error');
    });

    it('should handle non-Error throws', async () => {
      const mockHandler = vi.fn().mockRejectedValue('String error');
      const handler = createApiHandler(mockHandler);

      const req = {} as NextRequest;
      const response = await handler(req);
      const json = await response.json();

      expect(json.msg).toBe('系统错误');
    });
  });

  describe('validateRequest', () => {
    it('should parse and validate request with all required fields', async () => {
      const req = {
        json: vi.fn().mockResolvedValue({
          field1: 'value1',
          field2: 'value2',
        }),
      } as unknown as NextRequest;

      const result = await validateRequest(req, ['field1', 'field2']);

      expect(result).toEqual({
        field1: 'value1',
        field2: 'value2',
      });
    });

    it('should throw error when required field is missing', async () => {
      const req = {
        json: vi.fn().mockResolvedValue({
          field1: 'value1',
        }),
      } as unknown as NextRequest;

      await expect(validateRequest(req, ['field1', 'field2'])).rejects.toThrow(
        '缺少必需参数: field2'
      );
    });

    it('should throw error when required field is null', async () => {
      const req = {
        json: vi.fn().mockResolvedValue({
          field1: null,
        }),
      } as unknown as NextRequest;

      await expect(validateRequest(req, ['field1'])).rejects.toThrow(
        '缺少必需参数: field1'
      );
    });
  });
});
