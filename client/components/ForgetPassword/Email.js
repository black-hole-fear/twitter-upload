import { useState } from "react";
import { AlertSuccess, AlertError } from "../Alert/Alert";
import axios from "axios";

const Email = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState({
        success: "",
        error: "",
    });
    const [isSending, setIsSending] = useState(false);
    const { success, error } = status;

    const sendEmailHandler = async (e) => {
        e.preventDefault();
        if (email.trim() === "") {
            return setStatus({
                success: "",
                error: "Email is required.",
            });
        } else if (email.trim().length < email.length) {
            return setStatus({
                success: "",
                error: "Email cannot contain spaces.",
            });
        }
        try {
            setIsSending(true);
            const res = await axios.post("http://localhost:8000/api/forget-password/send-email", {
                email,
            });
            setStatus({
                success: res.data.message,
                error: ""
            })
            setEmail("");
        } catch (e) {
            setStatus({
                success: "",
                error: e.response.data.error
            })
        }
        setIsSending(false);
    };

    return (
        <form onSubmit={sendEmailHandler}>
            {success && <AlertSuccess>{success}</AlertSuccess>}
            {error && <AlertError>{error}</AlertError>}
            <div className="form-floating mb-3 w-75 mx-auto">
                <input
                    type="email"
                    className="form-control"
                    id="floatingInput"
                    placeholder="name@example.com"
                    onChange={(e) => {setEmail(e.target.value); setStatus({success: "", error: ""})}}
                    value={email}
                />
                <label htmlFor="floatingInput">Email address</label>
            </div>
            <div className="text-center">
                <button className="btn btn-outline-primary rounded-pill px-5 py-2 w-75" disabled={isSending}>
                    {isSending ? "Sending..": "Send"}
                </button>
            </div>
        </form>
    );
};

export default Email;
