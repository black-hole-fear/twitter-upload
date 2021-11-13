import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import User from "../components/User/User";
import { useSelector, useDispatch } from "react-redux";
import { followingActions } from "../store";
import Head from "next/head";

const search = ({ keyword, findUsers, token }) => {
    const followings = useSelector((state) => state.followingSlice.following);
    const [users, setUsers] = useState([]);
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
        setUsers(findUsers);
    }, [keyword]);

    return (
        <Fragment>
            <Head>
                <title>Search | Twizzer</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="p-3">
            <p className="display-5">Found {users.length} users.</p>
            <div className="p-3">
                {users.map((user, index) => (
                    <User user={user} checkFollowing={followings} token={token} key={index} />
                ))}
            </div>
        </div>
        </Fragment>
    );
};

export const getServerSideProps = async (ctx) => {
    const keyword = ctx.query.key;
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
        if (keyword.trim() === "") {
            return {
                props: {
                    keyword,
                    findUsers: [],
                    token,
                },
            };
        }
        const res = await axios.post(
            "http://localhost:8000/api/user/user-searching",
            { keyword },
            {
                headers: {
                    Authorization: "Bearer " + token,
                },
            }
        );
        return {
            props: {
                keyword,
                findUsers: res.data.data,
                token,
            },
        };
    } catch (e) {
        return {
            redirect: {
                permanent: false,
                destination: "/",
            },
        };
    }
};

export default search;
