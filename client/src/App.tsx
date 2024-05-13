import { RegisterAndLogin } from "./Components/RegisterAndLogin";
import { Chat } from "./Components/Chat";
import "./App.css";
import axios from "axios";
import { useSelector } from "react-redux";
import { IRootState } from "./main";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { LOGIN } from "./feature/user";
function App() {
  axios.defaults.baseURL = "https://chattime-1.onrender.com";
  //for cookies, HTTP authentication information
  axios.defaults.withCredentials = true;
  const dispatch = useDispatch();
  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await axios.get("/profile");
        const { data } = response.data;
        const { userId, username } = data;
        dispatch(LOGIN({ id: userId, username: username }));
      } catch (err) {
        console.log(err);
      }
    };
    getProfile();
  }, []);

  const user = useSelector((state: IRootState) => state.user.user);

  return <>{user.id ? <Chat></Chat> : <RegisterAndLogin></RegisterAndLogin>}</>;
}

export default App;
