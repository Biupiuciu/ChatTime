import { RegisterAndLogin } from "./Components/RegisterAndLogin";
import { Chat } from "./Components/Chat";
import "./App.css";
import axios from "axios";

import { useEffect } from "react";
import { useUserStore } from "./store/userStore";
import { LoginApi } from "./api/LoginApi";
function App() {
  axios.defaults.baseURL = "http://52.63.94.99:4040";
  // axios.defaults.baseURL = "https://chattime-1.onrender.com";
  //for cookies, HTTP authentication information
  axios.defaults.withCredentials = true;
  const { user, LOGIN } = useUserStore((state) => state);

  useEffect(() => {
    const getProfile = async () => {
      try {
        // const response = await axios.get("/profile");
        // const { data } = response.data;
        // const { userId, username } = data;
        // console.log(data);

        const response = await LoginApi.login({});
        LOGIN({ id: response.userId, username: response.username });
      } catch (err) {
        console.log(err);
      }
    };
    getProfile();
  }, []);

  return <>{user.id ? <Chat></Chat> : <RegisterAndLogin></RegisterAndLogin>}</>;
}

export default App;
