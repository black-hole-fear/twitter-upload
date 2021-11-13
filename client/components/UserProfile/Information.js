import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { followingActions } from "../../store";
import axios from "axios";
import Router from "next/router";
import { useState } from "react";
import jwt from "jsonwebtoken";
import FollowingUser from "./FollowingUser";

const Information = ({ user, token }) => {
    const dispatch = useDispatch();
    const checkFollowing = useSelector((state) => state.followingSlice.following);
    const { _id, following, follower, bio, profile_image, cover_image } = user;
    const { name, username } = user.user;
    const [followings, setFollowings] = useState(following);
    const [followers, setFollowers] = useState(follower);
    const [fetchedFollowings, setFetchedFollowings] = useState([]);
    const [fetchedFollowers, setFetchedFollowers] = useState([]);

    const showFollowing = async () => {
        try {
            const res = await axios.post(
                "http://localhost:8000/api/user/fetch-following",
                {
                    arrayOfFollowing: followings,
                    userId: _id,
                },
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );
            setFetchedFollowings(res.data);
        } catch (e) {
            alert(e.response.data.error);
        }
    };

    const showFollower = async () => {
        try {
            const res = await axios.post(
                "http://localhost:8000/api/user/fetch-follower",
                {
                    arrayOfFollower: followers,
                    userId: _id,
                },
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );
            setFetchedFollowers(res.data);
        } catch (e) {
            alert(e.response.data.error);
        }
    };

    const unFollowHandler = async () => {
        const answer = window.confirm("Are you sure you want to unfollow this user?");
        if (answer) {
            try {
                const res = await axios.post(
                    "http://localhost:8000/api/user/un-follow",
                    {
                        userId: _id,
                    },
                    {
                        headers: {
                            Authorization: "Bearer " + token,
                        },
                    }
                );
                dispatch(
                    followingActions.removeFollowing({
                        following: _id,
                    })
                );
                const id = jwt.decode(token)._id;
                setFollowers(followers.filter((f) => f != id));
                setTimeout(() => {
                    Router.reload(window.location.pathname);
                }, 200);
            } catch (e) {
                alert(e.response.data.error);
            }
        }
    };

    const followHandler = async () => {
        try {
            const res = await axios.post(
                "http://localhost:8000/api/user/follow",
                { userId: _id },
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );
            alert(res.data.message);
            if (res.data.message === "Followed") {
                dispatch(
                    followingActions.addFollowing({
                        following: _id,
                    })
                );
                const id = jwt.decode(token)._id;
                setFollowers([...followers, id]);
            }
        } catch (e) {
            alert(e.response.data.error);
        }
    };

    const modalFollowing = fetchedFollowings.map((f, index) => (
        <FollowingUser user={f} key={index} />
    ));

    const modalFollower = fetchedFollowers.map((f, index) => (
        <FollowingUser user={f} key={index} />
    ));

    return (
        <div>
            <div className="mb-3">
                <img
                    src={cover_image.url === "" ? "/static/images/cover-grey.png" : cover_image.url}
                    alt="cover image"
                    className="w-100 rounded-2"
                    style={{ height: "280px", objectFit: "cover" }}
                />
            </div>
            <div className="d-flex mb-3">
                <div>
                    <img
                        src={
                            profile_image.url === ""
                                ? "/static/images/unknown-profile.jpg"
                                : profile_image.url
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
                    {checkFollowing.includes(_id) ? (
                        <button
                            className="btn btn-success rounded-pill px-5"
                            onClick={unFollowHandler}
                        >
                            Following
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary rounded-pill px-5"
                            onClick={followHandler}
                        >
                            Follow
                        </button>
                    )}
                </div>
            </div>
            <div className="w-100">
                <p
                    className="badge text-secondary fs-5 border"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal2"
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
                    {followers.length} followers
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
