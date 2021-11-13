import { useState, useEffect } from "react";
import axios from "axios";
import { AlertSuccess, AlertError } from "../Alert/Alert";
import Resizer from "react-image-file-resizer";
import Router from "next/router";

const CreateForm = (props) => {
    const [enteredData, setEnteredData] = useState({
        content: "",
        images: [],
        tag: "",
    });
    const [textLength, setTextLength] = useState(0);
    const [status, setStatus] = useState({
        success: "",
        error: "",
    });
    const [isPosting, setIsPosting] = useState(false);
    const [tagsFetched, setTagsFetched] = useState([]);

    const { token } = props;
    const { content, images, tag } = enteredData;
    const { success, error } = status;

    const tagsFetching = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/tag/get-tags", {
                headers: {
                    Authorization: "Bearer " + token,
                },
            });
            setTagsFetched(res.data.tags);
        } catch (e) {
            setStatus({
                success: "",
                error: e.response.data.error,
            });
        }
    };

    useEffect(() => {
        tagsFetching();
        () => {
            return;
        };
    }, [success]);

    const resizeFile = (file) => {
        return new Promise((resolve) => {
            Resizer.imageFileResizer(
                file,
                300,
                300,
                "JPEG",
                100,
                0,
                (uri) => {
                    resolve(uri);
                },
                "base64"
            );
        });
    };

    const imagesChangeHandler = async (e) => {
        setStatus({
            success: "",
            error: "",
        })
        try {
            let imagesArray = [];
            for (let i = 0; i < e.target.files.length; i++) {
                const file = e.target.files[i];
                const image = await resizeFile(file);
                imagesArray.push(image)
            }
            setEnteredData({
                ...enteredData,
                images: imagesArray,
            })
        } catch (err) {
            setStatus({
                success: "",
                error: "Fuck this image.",
            });
        }
    };

    const selectRadioHandler = (id) => {
        setEnteredData({
            ...enteredData,
            tag: id,
        });
        setStatus({
            success: "",
            error: "",
        })
    };

    const contentChangeHandler = (e) => {
        setTextLength(e.target.value.length);
        setEnteredData({
            ...enteredData,
            content: e.target.value,
        });
        setStatus({
            success: "",
            error: "",
        })
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if(content.trim() === "") {
            return setStatus({
                success: "",
                error: "Content is required."
            })
        }
        if(content.trim().length > 256) {
            return setStatus({
                success: "",
                error: "Content is too long."
            })
        }
        if(images.length > 4) {
            return setStatus({
                success: "",
                error: "Uploaded images must be less than 4."
            })
        }
        try {
            setIsPosting(true);
            const res = await axios.post(
                "http://localhost:8000/api/post/create",
                {
                    content,
                    images,
                    tag,
                },
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );
            setStatus({
                success: res.data.message,
                error: "",
            });
            setEnteredData({
                content: "",
                images: [],
            });
            setTextLength(0);
        } catch (e) {
            setStatus({
                success: "",
                error: e.response.data.error,
            });
        }
        setIsPosting(false);
    };

    return (
        <form onSubmit={submitHandler}>
            {success && <AlertSuccess>{success}</AlertSuccess>}
            {error && <AlertError>{error}</AlertError>}
            <div className="mb-2 fs-5 text-secondary">length {textLength} / 256</div>
            <div className="form-floating">
                <textarea
                    className="form-control"
                    placeholder="Leave a comment here"
                    id="floatingTextarea"
                    onChange={contentChangeHandler}
                    maxLength={256}
                    style={{ height: "200px" }}
                    value={content}
                />
                <label htmlFor="floatingTextarea">Content</label>
            </div>
            <p className="mt-3 mb-2">Upload images (max 4 images)</p>
            <div className="d-flex align-items-center w-100">
                <div className="w-25 me-2">
                    <input
                        className="form-control"
                        onChange={imagesChangeHandler}
                        type="file"
                        accept="image/*"
                        multiple
                    />
                </div>
            </div>
            <p className="mt-2 mb-2">Select tag</p>
            <div
                className="my-2 w-25 bg-light p-3 rounded"
                style={{ height: "150px", overflow: "auto" }}
            >
                {tagsFetched.map((t, index) => {
                    return (
                        <div className="form-check" key={index}>
                            <input
                                className="form-check-input"
                                type="radio"
                                id="exampleRadios1"
                                onChange={() => selectRadioHandler(t._id)}
                                checked={tag === t._id}
                            />
                            <label className="form-check-label" htmlFor="exampleRadios1">
                                {t.tag_name}
                            </label>
                        </div>
                    );
                })}
            </div>
            <div className="mt-3">
                <div className="w-100 text-end">
                    <button className="btn btn-secondary w-25" disabled={isPosting}>
                        {isPosting ? "Posting..": "Post"}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default CreateForm;
