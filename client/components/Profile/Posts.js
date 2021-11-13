import { useState, useEffect } from "react";
import Post from "../Post/Post";
import Retweet from "../Post/Retweet";
import { AlertError } from "../Alert/Alert";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import jwt from "jsonwebtoken";

const Posts = ({ token }) => {
    const { _id } = jwt.decode(token);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState("");
    const [isEmpty, setIsEmpty] = useState(false);
    const [management, setManagement] = useState({
        limit: 5,
        skip: 0,
    });

    const { limit, skip } = management;

    const fetchPosts = async () => {
        try {
            const res = await axios.post(
                "http://localhost:8000/api/post/get-posts",
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
                if (post._id === id && post.type !== "retweet") {
                    const filteredRetweet = post.retweet.filter((val) => val !== _id);
                    return {
                        ...post,
                        retweet: filteredRetweet,
                    };
                } else {
                    return post;
                }
            });
            const filtered = newPosts.filter(val => val._id !== res.data.deletedRetweet);
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
                if (post.type === "post") {
                    return (
                        <Post
                            key={index}
                            token={token}
                            onLikeHandler={likeHandler}
                            onUnlikeHandler={unlikeHandler}
                            onRetweetHandler={retweetHandler}
                            onUnRetweetHandler={unRetweetHandler}
                            post={post}
                        />
                    );
                } else if (post.type === "retweet") {
                    return <Retweet key={index} post={post} />;
                }
            })}
        </InfiniteScroll>
    );

    return (
        <div className="px-5 py-2">
            {error && <AlertError>{error}</AlertError>}
            {allPosts}
        </div>
    );
};

export default Posts;
