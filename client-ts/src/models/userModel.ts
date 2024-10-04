export interface UpdateUserInfoModel {
    age: string
    gender: string
    congenital_disorders: string
}

export interface ReadUserProfileModel {
    username: string;
    age?: string;
    gender?: string;
    congenital_disorders?: string;
}

export interface UserCreateModel {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
}
    
export interface UserLoginModel {
    email: string;
    password: string;
}
