import { describe, it, expect } from 'vitest';
import {
  STEP_NAMES,
  API_ENDPOINTS,
  SYSTEM_PROMPTS,
  FALLBACK_CONTENTS,
  getApiEndpoint,
  getStepName,
  getSystemPrompt,
  getFallbackContent,
} from './project';

describe('project constants', () => {
  describe('STEP_NAMES', () => {
    it('should have exactly 5 step names', () => {
      expect(STEP_NAMES).toHaveLength(5);
    });

    it('should have correct step names', () => {
      expect(STEP_NAMES[0]).toBe('需求理解');
      expect(STEP_NAMES[1]).toBe('接口设计');
      expect(STEP_NAMES[2]).toBe('数据库设计');
      expect(STEP_NAMES[3]).toBe('处理逻辑设计');
      expect(STEP_NAMES[4]).toBe('代码生成');
    });
  });

  describe('API_ENDPOINTS', () => {
    it('should have exactly 5 API endpoints', () => {
      expect(API_ENDPOINTS).toHaveLength(5);
    });

    it('should have correct API endpoints', () => {
      expect(API_ENDPOINTS[0]).toBe('/api/analyze');
      expect(API_ENDPOINTS[1]).toBe('/api/design/interfaces');
      expect(API_ENDPOINTS[2]).toBe('/api/design/database');
      expect(API_ENDPOINTS[3]).toBe('/api/design/business-logic');
      expect(API_ENDPOINTS[4]).toBe('/api/generate/code');
    });
  });

  describe('SYSTEM_PROMPTS', () => {
    it('should have exactly 5 system prompts', () => {
      expect(SYSTEM_PROMPTS).toHaveLength(5);
    });

    it('should have non-empty prompts', () => {
      SYSTEM_PROMPTS.forEach(prompt => {
        expect(prompt).toBeTruthy();
        expect(typeof prompt).toBe('string');
        expect(prompt.length).toBeGreaterThan(0);
      });
    });
  });

  describe('FALLBACK_CONTENTS', () => {
    it('should have exactly 5 fallback contents', () => {
      expect(FALLBACK_CONTENTS).toHaveLength(5);
    });

    it('should have non-empty fallback contents', () => {
      FALLBACK_CONTENTS.forEach(content => {
        expect(content).toBeTruthy();
        expect(typeof content).toBe('string');
        expect(content.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getApiEndpoint', () => {
    it('should return correct API endpoint for step number', () => {
      expect(getApiEndpoint(1)).toBe('/api/analyze');
      expect(getApiEndpoint(2)).toBe('/api/design/interfaces');
      expect(getApiEndpoint(3)).toBe('/api/design/database');
      expect(getApiEndpoint(4)).toBe('/api/design/business-logic');
      expect(getApiEndpoint(5)).toBe('/api/generate/code');
    });

    it('should throw error for invalid step number', () => {
      expect(() => getApiEndpoint(0)).toThrow();
      expect(() => getApiEndpoint(6)).toThrow();
    });
  });

  describe('getStepName', () => {
    it('should return correct step name for step number', () => {
      expect(getStepName(1)).toBe('需求理解');
      expect(getStepName(2)).toBe('接口设计');
      expect(getStepName(3)).toBe('数据库设计');
      expect(getStepName(4)).toBe('处理逻辑设计');
      expect(getStepName(5)).toBe('代码生成');
    });

    it('should throw error for invalid step number', () => {
      expect(() => getStepName(0)).toThrow();
      expect(() => getStepName(6)).toThrow();
    });
  });

  describe('getSystemPrompt', () => {
    it('should return correct system prompt for step number', () => {
      expect(getSystemPrompt(1)).toBe(SYSTEM_PROMPTS[0]);
      expect(getSystemPrompt(2)).toBe(SYSTEM_PROMPTS[1]);
      expect(getSystemPrompt(3)).toBe(SYSTEM_PROMPTS[2]);
      expect(getSystemPrompt(4)).toBe(SYSTEM_PROMPTS[3]);
      expect(getSystemPrompt(5)).toBe(SYSTEM_PROMPTS[4]);
    });

    it('should throw error for invalid step number', () => {
      expect(() => getSystemPrompt(0)).toThrow();
      expect(() => getSystemPrompt(6)).toThrow();
    });
  });

  describe('getFallbackContent', () => {
    it('should return correct fallback content for step number', () => {
      expect(getFallbackContent(1)).toContain('需求分析结果');
      expect(getFallbackContent(2)).toContain('接口设计结果');
      expect(getFallbackContent(3)).toContain('数据库设计结果');
      expect(getFallbackContent(4)).toContain('业务逻辑设计结果');
      expect(getFallbackContent(5)).toContain('代码生成结果');
    });

    it('should replace projectName in fallback content', () => {
      const content = getFallbackContent(1, 'Test Project');
      expect(content).toContain('Test Project');
    });

    it('should throw error for invalid step number', () => {
      expect(() => getFallbackContent(0)).toThrow();
      expect(() => getFallbackContent(6)).toThrow();
    });
  });
});
