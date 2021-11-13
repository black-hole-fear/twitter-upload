import Link from "next/link";
import moment from "moment";
import { Fragment } from "react";

const Retweet = ({ post }) => {
    const imageLength = post.origin_post.images.length;

    let imageContent = "";

    if (imageLength > 0) {
        if (imageLength === 1) {
            imageContent = (
                <div className="w-100 px-4 py-2 text-center">
                    <img
                        src={post.origin_post.images[0].url}
                        alt="image"
                        style={{ height: "280px", width: "auto", objectFit: "cover" }}
                    />
                </div>
            );
        } else if (imageLength === 2) {
            imageContent = (
                <div className="w-100 d-flex px-4 py-2 text-center">
                    <img
                        src={post.origin_post.images[0].url}
                        alt="image"
                        className="w-50 me-1"
                        style={{ objectFit: "cover" }}
                    />
                    <img
                        src={post.origin_post.images[1].url}
                        alt="image"
                        className="w-50 ms-1"
                        style={{ objectFit: "cover" }}
                    />
                </div>
            );
        } else if (imageLength === 3) {
            imageContent = (
                <div className="w-100 px-5 py-3 text-center">
                    <div className="w-100 mb-2">
                        <img
                            src={post.origin_post.images[0].url}
                            alt="image"
                            className="w-100"
                            style={{ height: "300px", objectFit: "cover" }}
                        />
                    </div>
                    <div className="d-flex w-100">
                        <img
                            src={post.origin_post.images[1].url}
                            alt="image"
                            className="w-50 me-1"
                            style={{ objectFit: "cover" }}
                        />
                        <img
                            src={post.origin_post.images[2].url}
                            alt="image"
                            className="w-50 ms-1"
                            style={{ objectFit: "cover" }}
                        />
                    </div>
                </div>
            );
        } else if (imageLength === 4) {
            imageContent = (
                <div className="w-100 px-5 py-3 text-center">
                    <div className="d-flex w-100 mb-2">
                        <img
                            src={post.origin_post.images[0].url}
                            alt="image"
                            className="w-50 me-1"
                        />
                        <img
                            src={post.origin_post.images[1].url}
                            alt="image"
                            className="w-50 ms-1"
                        />
                    </div>
                    <div className="d-flex w-100">
                        <img
                            src={post.origin_post.images[2].url}
                            alt="image"
                            className="w-50 me-1"
                        />
                        <img
                            src={post.origin_post.images[3].url}
                            alt="image"
                            className="w-50 ms-1"
                        />
                    </div>
                </div>
            );
        }
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

    const retweetedBy = (
        <div className="d-flex align-items-center justify-content-between rounded-top">
            <Link href={`/profile/${post.retweetedBy.user.username}`}>
                <span
                    className="text-decoration-none fs-5 text-secondary"
                    style={{ cursor: "pointer" }}
                >
                    Retweeted by <span className="text-primary">{post.retweetedBy.user.name}</span>
                </span>
            </Link>
            <div className="text-end pe-2">
                <p className="text-secondary">{moment(post.createdAt).fromNow()}</p>
            </div>
        </div>
    );

    return (
        <Fragment>
            <div className="alert alert-light rounded-3 shadow-sm border my-3">
                <div className="border-top bg-light border-start border-end px-2 w-75 rounded-3">{retweetedBy}</div>
                <div className="px-4 pb-4">
                    <div className="d-flex justify-content-around">
                        <Link href={`/profile/${post.postedBy.user.username}`}>
                            <a
                                className="m-1 d-flex align-items-center w-50 text-break"
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
                                        height: "50px",
                                        width: "50px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />
                                <div className="p-1">
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
                        <Link href={`/post/${post.origin_post._id}`}>
                            <a className="ms-auto p-2">
                                <img
                                    src="/static/images/full-screen.png"
                                    style={{ width: "25px" }}
                                    alt="view"
                                    title="View post"
                                />
                            </a>
                        </Link>
                    </div>
                    <div className="px-4 text-break">
                        <p>
                            {post.origin_post.content} {tag_name}
                        </p>
                    </div>
                    {imageContent}
                </div>
            </div>
        </Fragment>
    );
};

export default Retweet;
