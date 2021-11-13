import Link from "next/link";
import moment from "moment";
import { Fragment, useState } from "react";
import { AlertSuccess, AlertError } from "../Alert/Alert";
import axios from "axios";
import Resizer from "react-image-file-resizer";
import jwt from "jsonwebtoken";
import Router from "next/router";

const Post = ({
    post,
    token,
    onLikeHandler,
    onUnlikeHandler,
    onRetweetHandler,
    onUnRetweetHandler,
    onInsertNewCommentHandler,
    onSetCommentNumber,
    commentNumber
}) => {
    const { _id } = jwt.decode(token);
    const imageLength = post.images.length;
    const [data, setData] = useState({
        comment: "",
        image: "",
    });
    const [status, setStatus] = useState({
        success: "",
        error: "",
    });
    const [isCommenting, setIsCommenting] = useState(false);
    const ownerId = post.postedBy._id;
    const { success, error } = status;
    const { comment, image } = data;

    const commentChangeHandler = (e) => {
        setStatus({
            success: "",
            error: "",
        });
        setData({
            ...data,
            comment: e.target.value,
        });
    };

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

    const imageChangeHandler = async (e) => {
        setStatus({
            success: "",
            error: "",
        });
        const file = e.target.files[0];
        const image = await resizeFile(file);
        setData({
            ...data,
            image: image,
        });
    };

    const commentSubmitHandler = async (postId) => {
        if (comment.trim() === "") {
            return setStatus({
                success: "",
                error: "Comment is required.",
            });
        }
        if (comment.length > 256) {
            return setStatus({
                success: "",
                error: "Comment must be less than 256 characters.",
            });
        }
        try {
            setIsCommenting(true);
            const res = await axios.post(
                "http://localhost:8000/api/comment",
                {
                    comment,
                    ownerId,
                    postId,
                    image,
                },
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );
            onSetCommentNumber(commentNumber+1);
            setStatus({
                success: res.data.message,
                error: "",
            });
            setData({
                comment: "",
                image: "",
            });
            onInsertNewCommentHandler(res.data.newComment);
        } catch (e) {
            setStatus({
                success: "",
                error: e.response.data.error,
            });
        }
        setIsCommenting(false);
    };

    const deleteHandler = async (postId) => {
        const answer = window.confirm("Are you sure you want to delete this post.");
        if (answer) {
            try {
                const res = await axios.delete(
                    "http://localhost:8000/api/post/delete-post/" + postId,
                    {
                        headers: {
                            Authorization: "Bearer " + token,
                        },
                    }
                );
                Router.push("/profile");
            } catch (e) {
                alert(e.response.data.error);
            }
        }
    };

    let imageContent = "";

    if (imageLength === 1) {
        imageContent = (
            <div className="w-100 px-4 py-2 text-center">
                <img
                    src={post.images[0].url}
                    alt="image"
                    style={{ height: "280px", width: "auto", objectFit: "cover" }}
                />
            </div>
        );
    } else if (imageLength === 2) {
        imageContent = (
            <div className="w-100 d-flex px-4 py-2 text-center">
                <img
                    src={post.images[0].url}
                    alt="image"
                    className="w-50 me-1"
                    style={{ objectFit: "cover" }}
                />
                <img
                    src={post.images[1].url}
                    alt="image"
                    className="w-50 ms-1"
                    style={{ objectFit: "cover" }}
                />
            </div>
        );
    } else if (imageLength === 3) {
        imageContent = (
            <div className="w-100 px-4 py-2 text-center">
                <div className="w-100 mb-2">
                    <img
                        src={post.images[0].url}
                        alt="image"
                        className="w-100"
                        style={{ height: "300px", objectFit: "cover" }}
                    />
                </div>
                <div className="d-flex w-100">
                    <img
                        src={post.images[1].url}
                        alt="image"
                        className="w-50 me-1"
                        style={{ objectFit: "cover" }}
                    />
                    <img
                        src={post.images[2].url}
                        alt="image"
                        className="w-50 ms-1"
                        style={{ objectFit: "cover" }}
                    />
                </div>
            </div>
        );
    } else if (imageLength === 4) {
        imageContent = (
            <div className="w-100 px-4 py-2 text-center">
                <div className="d-flex w-100 mb-2">
                    <img src={post.images[0].url} alt="image" className="w-50 me-1" />
                    <img src={post.images[1].url} alt="image" className="w-50 ms-1" />
                </div>
                <div className="d-flex w-100">
                    <img src={post.images[2].url} alt="image" className="w-50 me-1" />
                    <img src={post.images[3].url} alt="image" className="w-50 ms-1" />
                </div>
            </div>
        );
    }

    let tag_name = <span></span>;
    if (post.tag !== null) {
        tag_name = (
            <span>
                <Link href={`/tag/${post.tag._id}`}>
                    <a>#{post.tag.tag_name}</a>
                </Link>
            </span>
        );
    }

    return (
        <Fragment>
            <div
                className="modal fade"
                id="exampleModal"
                tabIndex={-1}
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">
                                Comment
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>
                        <div className="modal-body">
                            {success && <AlertSuccess>{success}</AlertSuccess>}
                            {error && <AlertError>{error}</AlertError>}
                            <div className="form-floating">
                                <textarea
                                    className="form-control"
                                    placeholder="Leave a comment here"
                                    id="floatingTextarea2"
                                    onChange={commentChangeHandler}
                                    style={{ height: 200 }}
                                    value={comment}
                                    maxLength="256"
                                />
                                <label htmlFor="floatingTextarea2">Comments</label>
                            </div>
                            <div className="my-2">
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={imageChangeHandler}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => commentSubmitHandler(post._id)}
                                disabled={isCommenting}
                            >
                                {isCommenting ? "Commenting.." : "Comment"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="alert alert-light p-2 rounded-3 shadow-sm">
                <div
                    className={`${
                        _id === post.postedBy._id ? "d-flex justify-content-between" : ""
                    }`}
                >
                    <Link href={`/profile/${post.postedBy.user.username}`}>
                        <a
                            className="m-3 d-flex align-items-center w-50 text-break"
                            style={{ textDecoration: "none" }}
                        >
                            <img
                                src={
                                    post.postedBy.profile_image.url === ""
                                        ? "/static/images/unknown-profile.jpg"
                                        : post.postedBy.profile_image.url
                                }
                                alt=""
                                style={{
                                    height: "60px",
                                    width: "60px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                }}
                            />
                            <div className="p-2 d-flex align-items-center">
                                <p className="text-dark fw-bold">
                                    {post.postedBy.user.name}
                                    <br />
                                    <span className="fw-normal text-secondary">
                                        @{post.postedBy.user.username}
                                    </span>
                                </p>
                            </div>
                        </a>
                    </Link>
                    {_id === post.postedBy._id && (
                        <div className="p-3">
                            <img
                                src="/static/images/delete.png"
                                alt="delete"
                                style={{ width: "45px", cursor: "pointer" }}
                                onClick={() => deleteHandler(post._id)}
                                title="delete"
                            />
                        </div>
                    )}
                </div>
                <div className="px-3 text-break">
                    <p>
                        {post.content} {tag_name}
                    </p>
                </div>
                {imageContent}
                <div className="text-end px-4">
                    <p className="text-secondary">{moment(post.createdAt).fromNow()}</p>
                </div>
                <div className="d-flex justify-content-between p-2">
                    <div>
                        <img
                            src="/static/images/comment.png"
                            style={{ width: "35px", cursor: "pointer" }}
                            alt="comment image"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                        />
                        <span className="ms-1">{commentNumber}</span>
                    </div>
                    <div>
                        {post.retweet.includes(_id) ? (
                            <img
                                src="/static/images/retweet-on.png"
                                style={{ width: "35px", cursor: "pointer" }}
                                alt="retweet image"
                                onClick={() => onUnRetweetHandler(post._id, post.postedBy._id)}
                            />
                        ) : (
                            <img
                                src="/static/images/retweet-off.png"
                                style={{ width: "35px", cursor: "pointer" }}
                                alt="retweet image"
                                onClick={() => onRetweetHandler(post._id, post.postedBy._id)}
                            />
                        )}
                        <span className="ms-1">{post.retweet.length}</span>
                    </div>
                    <div>
                        {post.like.includes(_id) ? (
                            <img
                                src="/static/images/heart.png"
                                alt="like image"
                                style={{ cursor: "pointer", width: "32px" }}
                                onClick={() => onUnlikeHandler(post._id, post.postedBy._id)}
                            />
                        ) : (
                            <img
                                src="/static/images/heart-empty.png"
                                alt="like image"
                                style={{ cursor: "pointer", width: "32px" }}
                                onClick={() => onLikeHandler(post._id, post.postedBy._id)}
                            />
                        )}
                        <span className="ms-1">{post.like.length}</span>
                    </div>
                </div>
                <hr />
            </div>
        </Fragment>
    );
};

export default Post;
