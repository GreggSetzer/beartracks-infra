const ERROR_CODE = 500;
const OK_CODE = 200;

// If you configure CORS for an API, API Gateway ignores CORS
// headers returned from your backend integration.
// See: https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html
export interface LambdaResponse {
  statusCode: number;
  body: string;
}

export const handleError = (message: string, statusCode = ERROR_CODE): LambdaResponse => {
  return {
    statusCode,
    body: JSON.stringify({ message }),
  };
};

export const handleResponse = (responseBody: any, httpMethod = 'GET', statusCode = OK_CODE): LambdaResponse => {
  console.log(httpMethod);
  return {
    statusCode,
    body: JSON.stringify(responseBody),
  };
};

export const isValidParkCode = (userInput: string): boolean => {
  const regex = /^[a-z]{4}$/;
  return regex.test(userInput);
};

// Define the type for the sanitizer function
export type Sanitizer = (input: string) => string;

// We'll curry our function to pass in the xss library only once.
export const sanitizeObject = (sanitizer: Sanitizer) => <T>(obj: T): T => {
  if (typeof obj === 'string') {
    return sanitizer(obj) as unknown as T;
  } else if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(sanitizer)(item)) as unknown as T;
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      (acc as any)[key] = sanitizeObject(sanitizer)((obj as any)[key]);
      return acc;
    }, {} as T);
  }
  return obj;
};