import { useState } from "react";
import { AlertSuccess, AlertError } from "../Alert/Alert";
import axios from "axios";

const RegisterForm = () => {
    const [enteredData, setEnteredData] = useState({
        email: "",
        name: "",
        password: "",
        confirm: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({
        success: "",
        error: "",
    });

    const { email, name, password, confirm } = enteredData;
    const { success, error } = status;

    const emailValidator = (emailForCheck) => {
        const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(regex.test(emailForCheck)) {
            return true;
        }
        return false;
    }

    const dataChangeHandler = (type) => (e) => {
        setStatus({
            success: "",
            error: "",
        })
        setEnteredData({
            ...enteredData,
            [type]: e.target.value,
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if(email.trim() === "" || !emailValidator(email)) {
            return setStatus({
                success: "",
                error: "Email is invalid."
            })
        }else if(name.trim() === "") {
            return setStatus({
                success: "",
                error: "Name is required."
            })
        }else if(password.trim().length < 6 || confirm.trim().length < 6) {
            return setStatus({
                success: "",
                error: "Password must be at least 6 characters."
            })
        }else if(password.trim() !== confirm.trim()) {
            return setStatus({
                success: "",
                error: "Password does not match."
            })
        }
        setIsLoading(true);
        try {
            const res = await axios.post("http://localhost:8000/api/register", {
                email: email.trim(),
                name: name.trim(),
                password: password.trim(),
                confirm: confirm.trim()
            });
            setStatus({
                success: res.data.message,
                error: ""
            })
            setEnteredData({
                email: "",
                name: "",
                password: "",
                confirm: "",
            })
        }catch(e) {
            setStatus({
                success: "",
                error: e.response.data.error
            })
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={submitHandler}>
            <div className="mb-4">
                <p className="display-3 text-secondary">Register</p>
            </div>
            {success && <AlertSuccess>{success}</AlertSuccess>}
            {error && <AlertError>{error}</AlertError>}
            <div className="form-floating mb-3">
                <input
                    type="email"
                    className="form-control"
                    id="floatingInput1"
                    placeholder="name@example.com"
                    onChange={dataChangeHandler("email")}
                    value={email}
                />
                <label htmlFor="floatingInput1">Email address</label>
            </div>
            <div className="form-floating mb-3">
                <input
                    type="text"
                    className="form-control"
                    id="floatingInput2"
                    placeholder="Enter your name"
                    onChange={dataChangeHandler("name")}
                    value={name}
                />
                <label htmlFor="floatingInput2">Name</label>
            </div>
            <div className="form-floating mb-3">
                <input
                    type="password"
                    className="form-control"
                    id="floatingInput3"
                    placeholder="Enter your password"
                    onChange={dataChangeHandler("password")}
                    value={password}
                />
                <label htmlFor="floatingInput3">Password</label>
            </div>
            <div className="form-floating mb-3">
                <input
                    type="password"
                    className="form-control"
                    id="floatingInput4"
                    placeholder="Confirm your password"
                    onChange={dataChangeHandler("confirm")}
                    value={confirm}
                />
                <label htmlFor="floatingInput4">Confirm password</label>
            </div>
            <div className="text-end">
                <button className="btn btn-outline-secondary py-2 px-5" disabled={isLoading}>
                    {isLoading ? "Registering": "Register"}
                </button>
            </div>
        </form>
    );
};

export default RegisterForm;
