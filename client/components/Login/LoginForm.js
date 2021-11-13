import { useState } from "react";
import { AlertSuccess, AlertError } from "../Alert/Alert";
import axios from "axios";
import Router from "next/router";
import { authenticate } from "../../helpers/auth";
import Link from "next/link";

const LoginForm = () => {
    const [enteredData, setEnteredData] = useState({
        email: "",
        password: ""
    })
    const [status, setStatus] = useState({
        success: "",
        error: "",
    });

    const {email, password} = enteredData;
    const { success, error } = status;

    const emailValidator = (emailForCheck) => {
        const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(regex.test(emailForCheck)) {
            return true;
        }
        return false;
    }

    const enteredDataChangeHandler = (type) => (e) => {
        setStatus({
            success: "",
            error: ""
        })
        setEnteredData({
            ...enteredData,
            [type]: e.target.value
        })
    } 

    const loginHandler = async (e) => {
        e.preventDefault();
        if(email.trim() === "" || !emailValidator(email)) {
            return setStatus({
                success: "",
                error: "Email is invalid."
            })
        }else if(password.trim() === "" || password.trim().length < 6) {
            return setStatus({
                success: "",
                error: "Password must be at least 6 characters."
            })
        }
        try {
            const res = await axios.post("http://localhost:8000/api/login", enteredData)
            setStatus({
                success: res.data.message,
                error: ""
            })
            authenticate(res.data.token, res.data.userData);
            setEnteredData({
                email: "",
                password: ""
            })
            setTimeout(() => (res.data.userData.role === "user") ? Router.push("/"): Router.push("/admin"), 200);
        }catch(e) {
            setStatus({
                success: "",
                error: e.response.data.error
            })
        }
    }

    return (
        <form className="mx-auto w-100" onSubmit={loginHandler}>
            <div className="mb-5">
                <p className="display-3 text-secondary">Login</p>
            </div>
            {success && <AlertSuccess>{success}</AlertSuccess>}
            {error && <AlertError>{error}</AlertError>}
            <div className="form-floating mb-3">
                <input
                    type="email"
                    className="form-control"
                    id="floatingInput1"
                    placeholder="name@example.com"
                    onChange={enteredDataChangeHandler("email")}
                    value={email}
                />
                <label htmlFor="floatingInput1">Email address</label>
            </div>
            <div className="form-floating mb-3">
                <input
                    type="password"
                    className="form-control"
                    id="floatingInput2"
                    placeholder="Enter your password"
                    onChange={enteredDataChangeHandler("password")}
                    value={password}
                />
                <label htmlFor="floatingInput2">Password</label>
            </div>
            <div className="text-end d-flex justify-content-between">
                <Link href="/forget-password">
                    <a>
                        Forget password
                    </a>
                </Link>
                <button className="btn btn-outline-secondary py-2 px-5">
                    Login
                </button>
            </div>
        </form>
    );
};

export default LoginForm;
