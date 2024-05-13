import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useState } from "react";
import image from "../assets/speech bubble with client icon.png";
import axios from "axios";
import { useDispatch } from "react-redux";
import { LOGIN } from "../feature/user";
export const RegisterAndLogin = () => {
  const dispatch = useDispatch();

  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isTyped, setIsTyped] = useState(true);
  const [isForLogIn, setIsForLogIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  let headers = {
    "Content-Type": "application/json",
    Accept: "application/json",

    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Credentials": "true",
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const url = isForLogIn ? "/login" : "/register";
      const { data } = await axios.post(
        url,
        {
          username,
          password,
        },
        { headers }
      );
      if (data.id) {
        LoginAfterRegister();
      }
      console.log(data);
      console.log(isRegistered);
      if (data != "alreadyregistered") {
        dispatch(LOGIN({ id: data, username: username }));
      } else {
        setIsRegistered(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const LoginAfterRegister = async () => {
    const response = await axios.get("/profile");
    const { data } = response.data;
    const { userId, username } = data;
    dispatch(LOGIN({ id: userId, username: username }));
  };
  return (
    <div className="w-screen h-screen items-center justify-center flex flex-col">
      <form action="" className="flex flex-col w-1/4 gap-4 min-w-72 -mt-12">
        <img src={image} alt="" className="w-1/3 mx-auto mb-12" />

        <div
          className={`w-full h-14 py-3 px-4 border-1.5 ${
            isRegistered ? "border-rose-400" : "border-lime-300"
          } rounded-full flex items-center gap-3`}
          onClick={() => {
            setIsTyped(false);
          }}
        >
          <PersonOutlineIcon sx={{ color: "#9CA3AF", fontSize: 24 }} />
          <input
            type="text"
            readOnly={isTyped}
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUserName(e.target.value);
              setIsRegistered(false);
            }}
            className="w-full  border-none   bg-white  outline-none text-medium"
          />
        </div>

        {isRegistered && (
          <div className="flex items-center h-1 w-full justify-center ">
            <h2 className="text-rose-400 text-sm ">
              Username has already been registered.
            </h2>
          </div>
        )}

        <div
          className="w-full h-14 py-3 px-4 border-1.5 border-lime-300 rounded-full flex items-center gap-3"
          onClick={() => {
            setIsTyped(false);
          }}
        >
          <LockOpenIcon sx={{ color: "#9CA3AF", fontSize: 24 }} />
          <input
            type="password"
            placeholder="Password"
            className="w-full  border-none   bg-white  outline-none text-medium"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </div>
        <button
          className="w-full h-14 bg-lime-300  border-lime-300 rounded-full text-dark hover:bg-lime-400"
          onClick={handleSubmit}
        >
          {isForLogIn ? "Log In" : "Register"}
        </button>
      </form>
      <div className="flex gap-2 mt-4">
        <h2>{isForLogIn ? " Dont have an account?" : "Already a member?"}</h2>
        <h2
          className="underline decoration-solid hover:text-lime-300"
          onClick={() => {
            if (!isForLogIn) {
              setIsRegistered(false);
            }
            setIsForLogIn(!isForLogIn);
            setPassword("");
            setUserName("");
          }}
        >
          {isForLogIn ? "Register" : "Log in"}
        </h2>
      </div>
      <div className="mt-16  text-sm text-medium">
        <h2 className="m-auto">Test User 1: Sean / Sean</h2>
      </div>
      <div className="mt-2 text-sm text-medium">
        <h2 className="mx-auto">Test User 2: BC / BC</h2>
      </div>
    </div>
  );
};
