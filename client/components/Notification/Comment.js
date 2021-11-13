import moment from "moment";
import Link from "next/link";

const Comment = ({ notification }) => {
    const { from_user, createdAt, origin_post } = notification;
    const { user, profile_image } = from_user;
    const { name, username } = user;

    return (
        <div className="alert bg-light rounded-3 shadow-sm">
            <div className="d-flex justify-content-around">
                <Link href={`/profile/${username}`}>
                    <a className="d-flex align-items-center" style={{ textDecoration: "none" }}>
                        <img
                            src={
                                profile_image.url === ""
                                    ? "/static/images/unknown-profile.jpg"
                                    : profile_image.url
                            }
                            style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                                borderRadius: "50%",
                            }}
                            alt="profile image"
                        />
                        <div className="w-100 ms-2 d-flex">
                            <p className="fw-bold">
                                {name}
                                <span className="text-secondary">
                                    ( @{username} )
                                    <span className="text-dark">
                                        comment your post.
                                        <img
                                            className="ms-1"
                                            style={{ width: "25px" }}
                                            src="/static/images/comment.png"
                                            alt="heart"
                                        />
                                    </span>
                                </span>
                            </p>
                        </div>
                    </a>
                </Link>
                <Link href={`/post/${origin_post}`}>
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
            <div className="d-flex">
                <p className="text-dark ms-auto">{moment(createdAt).fromNow()}</p>
            </div>
        </div>
    );
};

export default Comment;
