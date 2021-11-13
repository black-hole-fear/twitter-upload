import Link from "next/link";
import moment from "moment";
import axios from "axios";
import Router from "next/router";

const Post = ({ post, token, commentNumber }) => {
    const imageLength = post.images.length;

    const deleteHandler = async (postId) => {
        const answer = window.confirm("Are you sure you want to delete this post.");
        if (answer) {
            try {
                const res = await axios.delete(
                    "http://localhost:8000/api/admin/delete-post/" + postId,
                    {
                        headers: {
                            Authorization: "Bearer " + token,
                        },
                    }
                );
                Router.push("/admin/view-posts");
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
        <div className="alert alert-light p-2 rounded-3 shadow-sm">
            <div className="d-flex justify-content-between">
                <Link href={`/admin/profile/${post.postedBy.user.username}`}>
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
                <div className="p-3">
                    <img
                        src="/static/images/delete.png"
                        alt="delete"
                        style={{ width: "45px", cursor: "pointer" }}
                        onClick={() => deleteHandler(post._id)}
                        title="delete"
                    />
                </div>
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
                        style={{ width: "35px" }}
                        alt="comment image"
                    />
                    <span className="ms-1">{commentNumber}</span>
                </div>
                <div>
                    <img
                        src="/static/images/retweet-on.png"
                        style={{ width: "35px" }}
                        alt="retweet image"
                    />
                    <span className="ms-1">{post.retweet.length}</span>
                </div>
                <div>
                    <img
                        src="/static/images/heart.png"
                        alt="like image"
                        style={{ width: "32px" }}
                    />
                    <span className="ms-1">{post.like.length}</span>
                </div>
            </div>
            <hr />
        </div>
    );
};

export default Post;
