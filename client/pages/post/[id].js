import axios from "axios";
import OnePost from "../../components/Post/OnePost";
import Comment from "../../components/Comment/Comment";
import { useState, useEffect, Fragment } from "react";
import Head from "next/head";
import jwt from "jsonwebtoken";
import InfiniteScroll from "react-infinite-scroll-component";

const PostPage = ({ post, token, postId }) => {
    const { _id } = jwt.decode(token);
    const [currentPost, setCurrentPost] = useState(post);
    const [comments, setComments] = useState([]);
    const [commentNumber, setCommentNumber] = useState(currentPost.comment_number);
    const [isEmpty, setIsEmpty] = useState(false);
    const [management, setManagement] = useState({
        limit: 5,
        skip: 0,
    });
    const { limit, skip } = management;

    const fetchComments = async () => {
        try {
            const res = await axios.post(
                "http://localhost:8000/api/comment/get-comments",
                {
                    postId,
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
                    skip: [...comments, ...res.data].length,
                });
            }
            setComments([...comments, ...res.data]);
        } catch (e) {
            console.log(e);
        }
    };

    const insertNewCommentHandler = async (newComment) => {
        setComments([newComment, ...comments])
    };

    useEffect(() => {
        fetchComments();
    }, []);

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
            const newLike = [...currentPost.like, _id];
            const newPost = {
                ...currentPost,
                like: newLike,
            };
            setCurrentPost(newPost);
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
            const newLike = currentPost.like.filter((val) => val !== _id);
            const newPost = {
                ...currentPost,
                like: newLike,
            };
            setCurrentPost(newPost);
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
            const newRetweet = [...currentPost.retweet, _id];
            const newPost = {
                ...currentPost,
                retweet: newRetweet,
            };
            setCurrentPost(newPost);
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
            const newRetweet = currentPost.like.filter((val) => val !== _id);
            const newPost = {
                ...currentPost,
                retweet: newRetweet,
            };
            setCurrentPost(newPost);
        } catch (e) {
            alert(e.response.data.error);
        }
    };

    const deleteCommentHandler = async (commentId) => {
        const answer = window.confirm("Are you sure you want to delete this comment.");
        if(answer) {
            try {
                const res = await axios.post("http://localhost:8000/api/comment/delete", {
                    commentId
                }, {
                    headers: {
                        Authorization: "Bearer " + token,
                    }
                })
                const filteredComments = comments.filter((val) => val._id !== commentId);
                setComments(filteredComments);
                setCommentNumber(commentNumber-1)
            }catch(e) {
                alert(e.response.data.error);
            }
        }
    };

    return (
        <Fragment>
            <Head>
                <title>Post | Twizzer</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="p-4">
            <OnePost
                token={token}
                post={currentPost}
                onLikeHandler={likeHandler}
                onUnlikeHandler={unlikeHandler}
                onRetweetHandler={retweetHandler}
                onUnRetweetHandler={unRetweetHandler}
                onInsertNewCommentHandler={insertNewCommentHandler}
                onSetCommentNumber={setCommentNumber}
                commentNumber={commentNumber}
            />
            <hr />
            <div>
                <span className="fw-bold fs-5 text-secondary">Comments</span>
                <InfiniteScroll
                    dataLength={comments.length}
                    next={fetchComments}
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
                    <div className="p-2">
                        {comments.map((comment, index) => {
                            return (
                                <Comment
                                    key={index}
                                    _id={_id}
                                    comment={comment}
                                    onDeleteHandler={deleteCommentHandler}
                                />
                            );
                        })}
                    </div>
                </InfiniteScroll>
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
        const postId = ctx.params.id;
        const res = await axios.post(
            "http://localhost:8000/api/post/get-post",
            {
                postId,
            },
            {
                headers: {
                    Authorization: "Bearer " + token,
                },
            }
        );
        return {
            props: {
                token,
                post: res.data,
                postId,
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

export default PostPage;
