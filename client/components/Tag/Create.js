import { useState } from "react";
import axios from "axios";
import {AlertSuccess, AlertError} from "../Alert/Alert";

const Create = ({ token }) => {
    const [tag, setTag] = useState("");
    const [status, setStatus] = useState({
        success: "",
        error: "",
    });
    const [isCreating, setIsCreating] = useState(false);

    const {success, error} = status;

    const tagChangeHandler = (e) => {
        setStatus({
            success: "",
            error: ""
        })
        setTag(e.target.value);
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if(tag.trim() == "") {
            return setStatus({
                success: "",
                error: "Tag name is required."
            })
        }
        if(tag.trim().replace(" ", "").length < tag.trim().length) {
            return setStatus({
                success: "",
                error: "Tag name must not has a space."
            })
        }
        if(tag.trim().length > 32) {
            return setStatus({
                success: "",
                error: "Tag name must be less than 32 characters."
            })
        }
        try {
            const res = await axios.post("http://localhost:8000/api/tag/create", {
                tag: tag.trim()
            }, {
                headers: {
                    Authorization: "Bearer " + token
                }
            })
            setStatus({
                success: res.data.message,
                error: ""
            })
            setTag("")
        }catch(e) {
            setStatus({
                success: "",
                error: e.response.data.error
            })
        }
    };

    return (
        <form onSubmit={submitHandler}>
            {success && <AlertSuccess>{success}</AlertSuccess>}
            {error && <AlertError>{error}</AlertError>}
            <div className="form-floating mb-3">
                <input
                    type="text"
                    className="form-control"
                    id="floatingInput"
                    placeholder="Enter tag name"
                    onChange={tagChangeHandler}
                    value={tag}
                />
                <label htmlFor="floatingInput">Tag name</label>
            </div>
            <div className="w-100 text-end">
                <button className="btn btn-outline-secondary px-5" disabled={isCreating}>
                    {isCreating ? "Creating.." : "Create"}
                </button>
            </div>
        </form>
    );
};

export default Create;
