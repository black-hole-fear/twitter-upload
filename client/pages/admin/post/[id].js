import axios from "axios";
import OnePost from "../../../components/Admin/OnePost";
import Comment from "../../../components/Admin/Comment";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect, Fragment } from "react";
import Head from "next/head";

const UserPost = ({ post, token }) => {
    const [comments, setComments] = useState([]);
    const [commentNumber, setCommentNumber] = useState(0);
    const [isEmpty, setIsEmpty] = useState(false);
    const [management, setManagement] = useState({
        limit: 5,
        skip: 0,
    });

    const { limit, skip } = management;

    const fetchComments = async () => {
        try {
            const res = await axios.post(
                "http://localhost:8000/api/admin/get-comments",
                {
                    limit,
                    skip,
                    postId: post._id,
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
            setCommentNumber([...comments, ...res.data].length);
            setComments([...comments, ...res.data]);
        } catch (e) {
            alert(e.response.data.error);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const deleteCommentHandler = async (commentId, commentedBy) => {
        const answer = window.confirm("Are you sure you want to delete this comment.");
        if (answer) {
            try {
                const res = await axios.delete(
                    `http://localhost:8000/api/admin/delete-comment/${commentId}/${post._id}/${commentedBy}`,
                    {
                        headers: {
                            Authorization: "Bearer " + token,
                        },
                    }
                );
                const filtered = comments.filter((val) => val._id !== commentId);
                setComments(filtered);
                setCommentNumber(commentNumber - 1);
            } catch (e) {
                console.log(e);
                alert(e.response.data.error);
            }
        }
    };

    const allComments = (
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
            {comments.map((comment, index) => (
                <Comment
                    key={index}
                    comment={comment}
                    onDeleteCommentHandler={deleteCommentHandler}
                />
            ))}
        </InfiniteScroll>
    );

    return (
        <Fragment>
            <Head>
                <title>Post | Twizzer Admin</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div>
                <OnePost post={post} token={token} commentNumber={commentNumber} />
                <hr />
                <div>{allComments}</div>
            </div>
        </Fragment>
    );
};

export const getServerSideProps = async (ctx) => {
    const id = ctx.params.id;
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
        const res = await axios.post(
            "http://localhost:8000/api/admin/get-post",
            {
                id,
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

export default UserPost;
