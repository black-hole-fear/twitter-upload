import axios from "axios";
import { useState, useEffect, Fragment } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "../../components/Admin/Post";
import Head from "next/head";

const ViewAllPosts = ({ token }) => {
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
                "http://localhost:8000/api/admin/get-posts",
                {
                    limit,
                    skip,
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

    const deleteUserHandler = async (postId) => {
        const answer = window.confirm("Are you sure you want to delete this user.");
        if (answer) {
            try {
                const res = await axios.delete(
                    `http://localhost:8000/api/admin/delete-post/${postId}`,
                    {
                        headers: {
                            Authorization: "Bearer " + token,
                        },
                    }
                );
                const filteredPosts = posts.filter((val) => val._id !== postId);
                setPosts(filteredPosts);
                setManagement({
                    management,
                    skip: skip - 1,
                });
            } catch (e) {
                alert(e.response.data.error);
            }
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
                <title>Posts | Twizzer Admin</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="p-3">
                <p className="display-3">All posts</p>
                <hr />
                <div className="p-3">{allPosts}</div>
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
        const res = await axios.get("http://localhost:8000/api/check-admin", {
            headers: {
                Authorization: "Bearer " + token,
            },
        });
        return {
            props: {
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

export default ViewAllPosts;
