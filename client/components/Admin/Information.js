import React from 'react'

const Information = ({user}) => {
    return (
        <div>
            <div className="mb-3">
                <img
                    src={user.user_data.cover_image.url === "" ? "/static/images/cover-grey.png" : user.user_data.cover_image.url}
                    alt="cover image"
                    className="w-100 rounded-2"
                    style={{ height: "280px", objectFit: "cover" }}
                />
            </div>
            <div className="d-flex mb-3 px-3">
                <div>
                    <img
                        src={
                            user.user_data.profile_image.url === ""
                                ? "/static/images/unknown-profile.jpg"
                                : user.user_data.profile_image.url
                        }
                        className="mt-2"
                        style={{
                            width: "200px",
                            height: "200px",
                            borderRadius: "50%",
                            objectFit: "cover",
                        }}
                    />
                </div>
                <div className="p-3 text-break w-75">
                    <p className="fw-bold fs-3 text-dark">
                        {user.name}
                        <br />
                        <span className="fw-normal text-secondary">@{user.username}</span>
                    </p>
                    <p className="fs-5 text-secondary">{user.user_data.bio}</p>
                </div>
            </div>
            <div className="w-100">
                <p
                    className="badge text-secondary fs-5 border"
                >
                    {user.user_data.following.length} followings
                </p>
                <p
                    className="badge text-secondary fs-5 border ms-2"
                >
                    {user.user_data.follower.length} followers
                </p>
            </div>
        </div>
    );
}

export default Information
