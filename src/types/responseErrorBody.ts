export type ResponseErrorBody =
  | {
      // 422以外
      error: string;
      redirectTo?: string;
    }
  | {
      // バリデーションエラー422
      errors: Record<string, string>;
      redirectTo?: string;
    };
