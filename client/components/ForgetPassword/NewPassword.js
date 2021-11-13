import { useState } from "react";
import { AlertSuccess, AlertError } from "../Alert/Alert";
import axios from "axios";

const NewPassword = ({ email, token }) => {
    const [enteredData, setEnteredData] = useState({
        password: "",
        confirm: "",
    });
    const [status, setStatus] = useState({
        success: "",
        error: "",
    });
    const [isChanging, setIsChanging] = useState(false);

    const { password, confirm } = enteredData;
    const { success, error } = status;

    const dataChangeHandler = (type) => (e) => {
        setStatus({
            success: "",
            error: ""
        })
        setEnteredData({
            ...enteredData,
            [type]: e.target.value,
        });
    };

    const changePasswordHandler = async (e) => {
        e.preventDefault();
        if (password.trim() === "") {
            return setStatus({
                success: "",
                error: "Password is required.",
            });
        }
        if (confirm.trim() === "") {
            return setStatus({
                success: "",
                error: "Confirm password is required.",
            });
        }
        if (password.trim().length < password.trim().length) {
            return setStatus({
                success: "",
                error: "Password must not contain spaces.",
            });
        }
        if (password !== confirm) {
            return setStatus({
                success: "",
                error: "Password does not match.",
            });
        }
        try {
            setIsChanging(true);
            const res = await axios.post("http://localhost:8000/api/forget-password/new-password", {
                password,
                confirm,
                token,
            });
            setStatus({
                success: res.data.message,
                error: "",
            });
            setEnteredData({
                password: "",
                confirm: ""
            })
        } catch (e) {
            setStatus({
                success: "",
                error: e.response.data.error,
            });
        }
        setIsChanging(false);
    };

    return (
        <form onSubmit={changePasswordHandler}>
            {success && <AlertSuccess>{success}</AlertSuccess>}
            {error && <AlertError>{error}</AlertError>}
            <div className="w-100 text-center mb-3">
                <span className="fs-4 text-secondary">Email : {email}</span>
            </div>
            <div className="form-floating mb-3 w-75 mx-auto">
                <input
                    type="password"
                    className="form-control"
                    id="floatingInput"
                    placeholder="enter your new password"
                    value={password}
                    onChange={dataChangeHandler("password")}
                />
                <label htmlFor="floatingInput">Password</label>
            </div>
            <div className="form-floating mb-3 w-75 mx-auto">
                <input
                    type="password"
                    className="form-control"
                    id="floatingInput1"
                    placeholder="confirm new password"
                    value={confirm}
                    onChange={dataChangeHandler("confirm")}
                />
                <label htmlFor="floatingInput1">Confirm password</label>
            </div>
            <div className="text-center">
                <button className="btn btn-outline-primary rounded-pill px-5 py-2 w-75" disabled={isChanging}>
                    {isChanging ? "Changing..": "Change"}
                </button>
            </div>
        </form>
    );
};

export default NewPassword;
