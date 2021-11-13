import axios from "axios";
import Information from "../../../components/Admin/Information";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "../../../components/Admin/Post";
import { useState, useEffect, Fragment } from "react";
import Head from "next/head";

const Profile = ({ user, token }) => {
    const [posts, setPosts] = useState([]);
    const [isEmpty, setIsEmpty] = useState(false);
    const [management, setManagement] = useState({
        limit: 5,
        skip: 0,
    });

    const { limit, skip } = management;

    const fetchPosts = async () => {
        try {
            const res = await axios.post(
                "http://localhost:8000/api/admin/get-user-posts",
                {
                    limit,
                    skip,
                    userId: user.user_data._id,
                },
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );
            if (res.data.length < 5) {
                setIsEmpty(true);
            } else {
                setManagement({
                    ...management,
                    skip: [...posts, ...res.data].length,
                });
            }
            setPosts([...posts, ...res.data]);
        } catch (e) {
            console.log(e);
            alert(e.response.data.error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const allPosts = (
        <InfiniteScroll
            dataLength={posts.length}
            next={fetchPosts}
            hasMore={!isEmpty}
            loader={
                <div className="w-100 text-center">
                    <img
                        src="/static/images/loading.gif"
                        style={{ width: "100px" }}
                        alt="loading.."
                    />
                </div>
            }
        >
            {posts.map((post, index) => (
                <Post key={index} post={post} />
            ))}
        </InfiniteScroll>
    );

    return (
        <Fragment>
            <Head>
                <title>{user.name} | Twizzer Admin</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="alert alert-light p-3">
                <Information user={user} />
                <hr />
                <div className="p-3">{allPosts}</div>
            </div>
        </Fragment>
    );
};

export const getServerSideProps = async (ctx) => {
    const username = ctx.params.username;
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
        const res = await axios.get("http://localhost:8000/api/admin/get-profile/" + username, {
            headers: {
                Authorization: "Bearer " + token,
            },
        });
        return {
            props: {
                token,
                user: res.data,
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

export default Profile;
