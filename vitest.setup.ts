import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 清理测试后的DOM
afterEach(() => {
  cleanup();
});
