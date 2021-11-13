import moment from "moment";
import Link from "next/link";

const Accept = ({ notification }) => {
    const { from_user, createdAt } = notification;
    const { user, profile_image } = from_user;
    const { name, username } = user;

    return (
        <div className="alert bg-light rounded-3 shadow-sm">
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
                                    accept your request.
                                    <img
                                        className="ms-1"
                                        style={{ width: "25px" }}
                                        src="/static/images/accepted.png"
                                        alt="heart"
                                    />
                                </span>
                            </span>
                        </p>
                    </div>
                </a>
            </Link>
            <div className="d-flex">
                <p className="text-dark ms-auto">{moment(createdAt).fromNow()}</p>
            </div>
        </div>
    );
};

export default Accept;
