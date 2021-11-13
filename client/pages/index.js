import { Fragment, useEffect, useState } from "react";
import axios from "axios";
import PopularUser from "../components/User/PopularUser";
import PopularTag from "../components/Tag/PopularTag";
import Post from "../components/Post/Post";
import Retweet from "../components/Post/Retweet";
import InfiniteScroll from "react-infinite-scroll-component";
import jwt from "jsonwebtoken";
import Head from "next/head";

const HomePage = ({ token }) => {
    const { _id } = jwt.decode(token);
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
                "http://localhost:8000/api/posts",
                { limit, skip },
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );
            if (res.data.length < 5) {
                setIsEmpty(true);
            } else {
                setIsEmpty(false);
                setManagement({
                    ...management,
                    skip: [...posts, ...res.data].length,
                });
            }
            setPosts([...posts, ...res.data]);
        } catch (e) {
            setError(e.response.data.error);
        }
    };

    const likeHandler = async (id, ownerPostId) => {
        try {
            const res = await axios.post(
                "http://localhost:8000/api/like",
                {
                    ownerPostId,
                    postId: id,
                },
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );
            const newPosts = posts.map((post, idx) => {
                if (post._id === id) {
                    const newLike = [...post.like, _id];
                    return {
                        ...post,
                        like: newLike,
                    };
                } else {
                    return post;
                }
            });
            setPosts(newPosts);
        } catch (e) {
            alert(e.response.data.error);
        }
    };

    const unlikeHandler = async (id, ownerPostId) => {
        try {
            const res = await axios.post(
                "http://localhost:8000/api/like/unlike",
                {
                    ownerPostId,
                    postId: id,
                },
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );
            const newPosts = posts.map((post, idx) => {
                if (post._id === id) {
                    const filteredLike = post.like.filter((val) => val !== _id);
                    return {
                        ...post,
                        like: filteredLike,
                    };
                } else {
                    return post;
                }
            });
            setPosts(newPosts);
        } catch (e) {
            alert(e.response.data.error);
        }
    };

    const retweetHandler = async (id, ownerPostId) => {
        try {
            const res = await axios.post(
                "http://localhost:8000/api/retweet",
                {
                    ownerPostId,
                    postId: id,
                },
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );
            const newPosts = posts.map((post, idx) => {
                if (post._id === id) {
                    const newTweet = [...post.retweet, _id];
                    return {
                        ...post,
                        retweet: newTweet,
                    };
                } else {
                    return post;
                }
            });
            setPosts([res.data.newTweet, ...newPosts]);
            setManagement({
                ...management,
                skip: skip+1
            })
        } catch (e) {
            alert(e.response.data.error);
        }
    };

    const unRetweetHandler = async (id, ownerPostId) => {
        try {
            const res = await axios.post(
                "http://localhost:8000/api/retweet/cancel-retweet",
                {
                    ownerPostId,
                    postId: id,
                },
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );
            const newPosts = posts.map((post, idx) => {
                if (post._id === id) {
                    const filteredRetweet = post.retweet.filter((val) => val !== _id);
                    return {
                        ...post,
                        retweet: filteredRetweet,
                    };
                } else {
                    return post;
                }
            });
            const filtered = newPosts.filter(val => (val._id !== res.data.deletedRetweet));
            setPosts(filtered);
            setManagement({
                ...management,
                skip: skip-1
            })
        } catch (e) {
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
            {posts.map((post, index) => {
                if(post.type === "post") {
                    return (
                        <Post
                            key={index}
                            onLikeHandler={likeHandler}
                            onUnlikeHandler={unlikeHandler}
                            onRetweetHandler={retweetHandler}
                            onUnRetweetHandler={unRetweetHandler}
                            token={token}
                            post={post}
                        />
                    );
                }else if(post.type === "retweet") {
                    return (
                        <Retweet
                            key={index}
                            onLikeHandler={likeHandler}
                            onUnlikeHandler={unlikeHandler}
                            onRetweetHandler={retweetHandler}
                            onUnRetweetHandler={unRetweetHandler}
                            token={token}
                            post={post}
                        />
                    );
                }
            })}
        </InfiniteScroll>
    );

    return (
        <Fragment>
            <Head>
                <title>Twizzer</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="row p-4">
                <div className="col-md-9 text-break">{allPosts}</div>
                <div className="col-md-3">
                    <PopularUser token={token} />
                    <PopularTag token={token} />
                </div>
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
        const res = await axios.get("http://localhost:8000/api/check-user", {
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
                destination: "/login",
            },
        };
    }
};

export default HomePage;
