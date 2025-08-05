import { describe, it, expect } from 'vitest'

describe('基础测试', () => {
  it('应该能正常运行', () => {
    expect(1 + 1).toBe(2)
  })

  it('应该能处理字符串', () => {
    expect('hello').toBe('hello')
  })
})
