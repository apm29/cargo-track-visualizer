/**
 * API 客户端配置
 */
export interface ApiConfig {
  baseURL: string
  timeout: number
  headers: Record<string, string>
}

/**
 * API 响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  code?: number
}

/**
 * API 错误
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * HTTP 客户端
 */
export class HttpClient {
  private config: ApiConfig

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseURL: config.baseURL || '/api',
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    }
  }

  /**
   * 发送 GET 请求
   */
  async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params ? this.buildQueryString(params) : ''
    const fullUrl = `${this.config.baseURL}${url}${queryString}`
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: this.config.headers,
        signal: AbortSignal.timeout(this.config.timeout),
      })

      return await this.handleResponse<T>(response)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 发送 POST 请求
   */
  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.config.baseURL}${url}`, {
        method: 'POST',
        headers: this.config.headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(this.config.timeout),
      })

      return await this.handleResponse<T>(response)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 发送 PUT 请求
   */
  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.config.baseURL}${url}`, {
        method: 'PUT',
        headers: this.config.headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(this.config.timeout),
      })

      return await this.handleResponse<T>(response)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 发送 DELETE 请求
   */
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.config.baseURL}${url}`, {
        method: 'DELETE',
        headers: this.config.headers,
        signal: AbortSignal.timeout(this.config.timeout),
      })

      return await this.handleResponse<T>(response)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 处理响应
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      throw new ApiError(
        response.status,
        response.statusText,
        await response.json().catch(() => null)
      )
    }

    const data = await response.json()
    return {
      success: true,
      data,
      code: response.status,
    }
  }

  /**
   * 处理错误
   */
  private handleError(error: any): ApiError {
    if (error instanceof ApiError) {
      return error
    }

    if (error.name === 'AbortError') {
      return new ApiError(408, '请求超时')
    }

    return new ApiError(500, error.message || '网络错误')
  }

  /**
   * 构建查询字符串
   */
  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })

    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
  }
}

/**
 * 默认 API 客户端实例
 */
export const apiClient = new HttpClient() 
