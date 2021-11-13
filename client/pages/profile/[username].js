import axios from "axios";
import Information from "../../components/UserProfile/Information";
import jwt from "jsonwebtoken";
import Posts from "../../components/UserProfile/Posts";
import { useDispatch } from "react-redux";
import { followingActions } from "../../store";
import { useEffect, Fragment } from "react";
import Head from "next/head";

const UserProfile = ({ token, user, posts }) => {
    const dispatch = useDispatch();
    const getFollowing = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/user/get-following", {
                headers: {
                    Authorization: "Bearer " + token,
                },
            });
            dispatch(
                followingActions.setInitialFollowing({
                    followingFetched: res.data.following,
                })
            );
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        getFollowing();
    }, []);

    let postsContent = (
        <div className="text-center my-5">
            <img src="/static/images/lock-icon.png" style={{ width: "150px" }} alt="lock" />
            <br />
            <span className="fs-4 fw-bold text-secondary">These posts are protected.</span>
        </div>
    );

    if (posts) {
        postsContent = <Posts posts={posts} userId={user._id} token={token} />;
    }

    return (
        <Fragment>
            <Head>
                <title>{user.user.name} | Twizzer</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="p-4 mt-4 rounded-3 bg-light">
                <Information user={user} token={token} />
                <hr />
                {postsContent}
            </div>
        </Fragment>
    );
};

export const getServerSideProps = async (ctx) => {
    try {
        let token;
        if (ctx.req.headers.cookie) {
            token = ctx.req.headers.cookie.slice(6);
        } else {
            return {
                redirect: {
                    permanent: false,
                    destination: "/login",
                },
            };
        }
        const username = ctx.params.username;
        const res = await axios.post(
            "http://localhost:8000/api/user/user-profile",
            {
                userUsername: username,
                limit: 5,
                skip: 0,
            },
            {
                headers: {
                    Authorization: "Bearer " + token,
                },
            }
        );
        const { _id } = jwt.decode(token);
        if (_id === res.data.user._id) {
            return {
                redirect: {
                    permanent: false,
                    destination: "/profile",
                },
            };
        }
        if (res.data.posts) {
            return {
                props: {
                    user: res.data.user,
                    posts: res.data.posts,
                    token,
                },
            };
        } else {
            return {
                props: {
                    user: res.data.user,
                    token,
                },
            };
        }
    } catch (e) {
        return {
            redirect: {
                permanent: false,
                destination: "/",
            },
        };
    }
};

export default UserProfile;
