export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  page: number;
  limit: number;
  total: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: string[];
}
