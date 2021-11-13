const FollowerUser = ({ user, onRemoveHandler }) => {
    return (
        <div className="p-2 d-flex align-items-center justify-content-between">
            <a href={`/profile/${user.user.username}`} className="d-flex align-items-center text-decoration-none" >
                <img
                    src={
                        user.profile_image.url === ""
                            ? "/static/images/unknown-profile.jpg"
                            : user.profile_image.url
                    }
                    style={{
                        width: "55px",
                        height: "55px",
                        borderRadius: "50%",
                        objectFit: "cover",
                    }}
                    alt="profile image"
                />
                <div className="ms-2">
                    <p className="fw-bold fs-5">
                        {user.user.name}
                        <br />
                        <span className="fw-normal text-secondary">@{user.user.username}</span>
                    </p>
                </div>
            </a>
            <div>
                <button className="btn btn-outline-danger rounded-pill px-2" onClick={() => onRemoveHandler(user._id)}>Remove</button>
            </div>
        </div>
    );
};

export default FollowerUser;
