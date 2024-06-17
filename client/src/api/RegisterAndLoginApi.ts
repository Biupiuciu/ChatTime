
import axios from "axios";
interface RegisterAndLoginRequest{
    url:'/login'|'/register'
    username:string
    password:string
}
interface RegisterAndLoginResponse{
   id?:string;
   error?:string;
   username?:string;
}

const registerorlogin=async(request:RegisterAndLoginRequest):Promise<RegisterAndLoginResponse>=>{
    const {url,username,password}=request;
    const { data } = await axios.post(url, {
        username,
        password,
      });
 return data;

}

export const RegisterOrLoginApi={registerorlogin}