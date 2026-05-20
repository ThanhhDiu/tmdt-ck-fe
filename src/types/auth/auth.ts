export type UserRole = 'customer' | 'technician' | 'admin';
export type UserStatus = 'verified' | 'pending' | 'banned';

export interface AuthUser {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: UserRole;
    avatar: string | null;
    status: UserStatus;
}

export interface AuthTokenData {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
}

/** POST /api/auth/login */
export interface LoginRequest {
    identifier: string;   // số điện thoại hoặc email
    password: string;
    role: Extract<UserRole, 'customer' | 'technician'>;
}

export interface LoginResponse {
    success: true;
    data: AuthTokenData;
}

export interface LoginErrorResponse {
    success: false;
    error: {
        code: 'INVALID_CREDENTIALS' | string;
        message: string;
    };
}

/** POST /api/auth/register */
export interface RegisterRequest {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: Extract<UserRole, 'customer' | 'technician'>;
}

export interface RegisterResponse {
    success: true;
    data: AuthTokenData;
}

export interface RegisterErrorResponse {
    success: false;
    error: {
        code: 'VALIDATION_ERROR' | string;
        message: string;
        fields?: {
            email?: string;
            phone?: string;
            [key: string]: string | undefined;
        };
    };
}

export type LoginApiResponse = LoginResponse | LoginErrorResponse;
export type RegisterApiResponse = RegisterResponse | RegisterErrorResponse;
