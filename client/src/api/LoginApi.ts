import axios from "axios";

interface LoginRequest {
    // ...
}

interface LoginResponse{
    //...
    userId: string
    username: string
}

const login = async (request: LoginRequest): Promise<LoginResponse> => {
    const response = await axios.get("/profile");
        const { data } = response.data;
        console.log(data);
    return data
}

export const LoginApi = {
    login
}