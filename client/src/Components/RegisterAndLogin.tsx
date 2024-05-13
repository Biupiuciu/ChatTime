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
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
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
      if (data == "cantlogin") {
        setIsLoading(false);
        console.log(data);
        return;
      }
      if (data.id) {
        LoginAfterRegister();
      }
      console.log(data);
      console.log(isRegistered);

      if (data != "alreadyregistered") {
        dispatch(LOGIN({ id: data, username: username }));
      } else {
        setIsRegistered(true);
        setIsLoading(false);
      }
    } catch (err) {
      console.log(err);
      setIsLoading(false);
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
          className="flex justify-center items-center w-full h-14 bg-lime-300  border-lime-300 rounded-full text-dark hover:bg-lime-400"
          onClick={handleSubmit}
        >
          <div className="flex -ml-4">
            {isLoading && (
              <svg
                aria-hidden="true"
                className="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 mr-2"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
            )}

            {isForLogIn ? "Log In" : "Register"}
          </div>
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
