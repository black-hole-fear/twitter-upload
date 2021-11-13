import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import Request from "../components/Request/Request";
import Head from "next/head";

const request = ({ token }) => {
    const [requests, setRequests] = useState([]);
    const [isFetching, setIsFetching] = useState(false);

    const acceptRequestHandler = async (from_user, id) => {
        try {
            const res = await axios.post(
                "http://localhost:8000/api/user/accept-request",
                {
                    requestFrom: from_user,
                    notificationId: id,
                },
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );
            const filteredRequests = requests.filter((val) => val._id !== id);
            setRequests(filteredRequests);
        } catch (e) {
            alert(e.response.data.error);
        }
    };

    const declineRequestHandler = async (id) => {
        try {
            const res = await axios.post(
                "http://localhost:8000/api/user/decline-request",
                {
                    notificationId: id,
                },
                {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                }
            );
            const filteredRequests = requests.filter((val) => val._id !== id);
            setRequests(filteredRequests);
        } catch (e) {
            alert(e.response.data.error);
        }
    };

    useEffect(async () => {
        setIsFetching(true);
        try {
            const res = await axios.get("http://localhost:8000/api/notification/requests", {
                headers: {
                    Authorization: "Bearer " + token,
                },
            });
            setRequests(res.data);
        } catch (e) {
            alert(e.response.data.error);
        }
        setIsFetching(false);
    }, []);

    return (
        <Fragment>
            <Head>
                <title>Requests | Twizzer</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="p-4 my-4 rounded-3 bg-light">
                <p className="display-3">Follow requests</p>
                {isFetching && (
                    <div className="text-center">
                        <img
                            src="/static/images/loading.gif"
                            style={{ width: "80px" }}
                            alt="loading"
                        />
                    </div>
                )}
                {!isFetching && (
                    <div>
                        <span className="fs-4 text-secondary">
                            Found {requests.length} requests
                        </span>
                        <hr />
                        <div className="p-3">
                            {requests.map((request, index) => (
                                <Request
                                    key={index}
                                    notification={request}
                                    token={token}
                                    onAcceptRequestHandler={acceptRequestHandler}
                                    onDeclineRequestHandler={declineRequestHandler}
                                />
                            ))}
                        </div>
                    </div>
                )}
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
                destination: "/",
            },
        };
    }
};

export default request;
