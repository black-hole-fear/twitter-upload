import { useEffect, useState } from "react";
import axios from "axios";
import Router from "next/router";
import FollowingUser from "../UserProfile/FollowingUser";
import FollowerUser from "../UserProfile/FollowerUser";

const Information = ({ token }) => {
    const [data, setData] = useState({
        _id: "",
        username: "",
        name: "",
        bio: "",
        following: [],
        follower: [],
        profile_image: "",
        cover_image: "",
    });
    const [follow, setFollow] = useState({
        followings: [],
        followers: [],
    });

    const { _id, username, name, bio, following, follower, profile_image, cover_image } = data;
    const { followings, followers } = follow;

    useEffect(async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/user/get-profile", {
                headers: {
                    Authorization: "Bearer " + token,
                },
            });
            setData({
                _id: res.data._id,
                username: res.data.user.username,
                name: res.data.user.name,
                bio: res.data.bio,
                following: res.data.following,
                follower: res.data.follower,
                profile_image: res.data.profile_image.url,
                cover_image: res.data.cover_image.url,
            });
        } catch (e) {
            Router.push("/");
        }
    }, []);

    const removeUserHandler = async (userId) => {
        console.log(userId);
        try {
            const res = await axios.post("http://localhost:8000/api/user/remove-follower", {
                userId
            }, {
                headers: {
                    Authorization: "Bearer " + token
                }
            })
            const filteredFollower = followers.filter(val => val._id !== userId);
            setFollow({
                ...follow,
                followers: filteredFollower,
            })
            setData({
                ...data,
                follower: filteredFollower
            })
        }catch(e) {
            alert(res.response.data.error);
        }
    }

    const showFollowing = async () => {
        try {
            const res = await axios.post("http://localhost:8000/api/user/fetch-following", {
                arrayOfFollowing: following,
                userId: _id
            }, {
                headers: {
                    Authorization: "Bearer " + token
                }
            })
            setFollow({
                ...follow,
                followings: res.data
            });
        }catch(e) { 
            alert(e.response.data.error)
        }
    }

    const showFollower = async () => {
        try {
            const res = await axios.post("http://localhost:8000/api/user/fetch-follower", {
                arrayOfFollower: follower,
                userId: _id
            }, {
                headers: {
                    Authorization: "Bearer " + token
                }
            })
            setFollow({
                ...follow,
                followers: res.data
            });
        }catch(e) {
            alert(e.response.data.error)
        }
    }

    const modalFollowing = (
        followings.map((f, index) => <FollowingUser user={f} key={index} />)
    )

    const modalFollower = (
        followers.map((f, index) => <FollowerUser user={f} key={index} onRemoveHandler={removeUserHandler} />)
    )

    return (
        <div>
            <div className="mb-3">
                <img
                    src={cover_image === "" ? "/static/images/cover-grey.png" : cover_image}
                    alt="cover image"
                    className="w-100 rounded-2"
                    style={{ height: "280px", objectFit: "cover" }}
                />
            </div>
            <div className="d-flex mb-3">
                <div>
                    <img
                        src={
                            profile_image === ""
                                ? "/static/images/unknown-profile.jpg"
                                : profile_image
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
                        {name}
                        <br />
                        <span className="fw-normal text-secondary">@{username}</span>
                    </p>
                    <p className="fs-5 text-secondary">{bio}</p>
                </div>
                <div className="text-end w-25">
                    <button
                        className="btn btn-outline-secondary px-5 rounded-pill"
                        onClick={() => Router.push("/profile/edit")}
                    >
                        Edit profile
                    </button>
                </div>
            </div>
            <div className="w-100">
                <p
                    className="badge text-secondary fs-5 border"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal2"
                    style={{ cursor: "pointer" }}
                    style={{ cursor: "pointer" }}
                    onClick={showFollowing}
                >
                    {following.length} followings
                </p>
                <p
                    className="badge text-secondary fs-5 border ms-2"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal1"
                    style={{ cursor: "pointer" }}
                    onClick={showFollower}
                >
                    {follower.length} followers
                </p>
            </div>

            <div
                className="modal fade"
                id="exampleModal2"
                tabIndex={-1}
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">
                                Followings
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>
                        <div className="modal-body">{modalFollowing}</div>
                    </div>
                </div>
            </div>

            <div
                className="modal fade"
                id="exampleModal1"
                tabIndex={-1}
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">
                                Followers
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>
                        <div className="modal-body">{modalFollower}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Information;
