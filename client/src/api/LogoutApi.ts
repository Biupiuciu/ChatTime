import axios from "axios";

interface LogoutRequest{

}

interface LogoutResponse{
    data?:string;
}

const Logout=async(request:LogoutRequest):Promise<LogoutResponse>=>{
 const response=await axios.post("/logout");
 return response;
}

export const LogoutApi={Logout}