import { describe, it, expect } from 'vitest';
import type {
  Project,
  Step,
  StepDetail,
  LogEntry,
  ProjectVersion,
  ApiResponse,
} from './index';

describe('types', () => {
  describe('Project type', () => {
    it('should allow valid Project object', () => {
      const project: Project = {
        code: 'test123',
        name: 'Test Project',
        requirements: 'Test requirements',
        status: 'active',
        current_step: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      expect(project).toBeDefined();
    });
  });

  describe('Step type', () => {
    it('should allow valid Step object', () => {
      const step: Step = {
        number: 1,
        name: '需求理解',
        status: 'pending',
        data: 'Test data',
        detail: {
          stepNumber: 1,
          stepName: '需求理解',
          systemPrompt: 'Test prompt',
          userPrompt: 'Test user prompt',
          input: 'Test input',
          output: 'Test output',
          rawResponse: null,
          timing: undefined,
        },
      };
      expect(step).toBeDefined();
    });
  });

  describe('StepDetail type', () => {
    it('should allow valid StepDetail object', () => {
      const stepDetail: StepDetail = {
        stepNumber: 1,
        stepName: '需求理解',
        systemPrompt: 'Test prompt',
        userPrompt: 'Test user prompt',
        input: 'Test input',
        output: 'Test output',
        rawResponse: null,
        timing: undefined,
      };
      expect(stepDetail).toBeDefined();
    });
  });

  describe('LogEntry type', () => {
    it('should allow valid LogEntry object', () => {
      const logEntry: LogEntry = {
        id: 1,
        project_code: 'test123',
        level: 'info',
        title: 'Test log',
        content: 'Test content',
        created_at: new Date().toISOString(),
      };
      expect(logEntry).toBeDefined();
    });
  });

  describe('ProjectVersion type', () => {
    it('should allow valid ProjectVersion object', () => {
      const version: ProjectVersion = {
        id: 1,
        project_code: 'test123',
        version_number: 'v1.0.0',
        version_name: 'Test Version',
        project_snapshot: '{}',
        steps_snapshot: '[]',
        created_at: new Date().toISOString(),
      };
      expect(version).toBeDefined();
    });
  });

  describe('ApiResponse type', () => {
    it('should allow valid ApiResponse with string data', () => {
      const response: ApiResponse<string> = {
        code: '000000',
        msg: 'Success',
        data: 'Test data',
      };
      expect(response).toBeDefined();
    });

    it('should allow valid ApiResponse with object data', () => {
      const response: ApiResponse<{ id: number; name: string }> = {
        code: '000000',
        msg: 'Success',
        data: { id: 1, name: 'Test' },
      };
      expect(response).toBeDefined();
    });
  });
});
