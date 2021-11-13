import Link from "next/link";
import moment from "moment";

const Comment = ({ comment, onDeleteCommentHandler }) => {
    const profile_image =
        comment.commentedBy.profile_image.url === ""
            ? "/static/images/unknown-image.jpg"
            : comment.commentedBy.profile_image.url;
    const name = comment.commentedBy.user.name;
    const username = comment.commentedBy.user.username;
    let image = "";
    if (comment.image) {
        image = (
            <div className="w-100 text-center">
                <img
                    src={comment.image.url}
                    style={{ height: "260px", width: "auto", objectFit: "cover" }}
                    alt="image"
                />
            </div>
        );
    }
    return (
        <div className="alert bg-light rounded-3 shadow-sm mx-5 my-3 p-3">
            <div className="w-100 d-flex justify-content-between">
                <Link href={`/admin/profile/${username}`}>
                    <a className="d-flex align-items-center text-decoration-none w-50">
                        <img
                            src={profile_image}
                            style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                                borderRadius: "50%",
                            }}
                            alt="profile image"
                        />
                        <div className="ms-2">
                            <p className="text-dark fw-bold">
                                {name}
                                <br />
                                <span className="fw-normal text-secondary">@{username}</span>
                            </p>
                        </div>
                    </a>
                </Link>
                <img
                    src="/static/images/delete.png"
                    style={{ height: "35px", width: "auto", cursor: "pointer" }}
                    alt="delete"
                    title="delete"
                    onClick={() => onDeleteCommentHandler(comment._id, comment.commentedBy._id)}
                />
            </div>
            <div className="w-100 p-4 text-break">
                <p>{comment.content}</p>
            </div>
            {image}
            <div className="w-100 my-2 text-end">
                <span>{moment(comment.createdAt).fromNow()}</span>
            </div>
        </div>
    );
};

export default Comment;
