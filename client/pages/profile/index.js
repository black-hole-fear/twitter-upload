import axios from "axios";
import Information from "../../components/Profile/Information";
import Posts from "../../components/Profile/Posts";
import { useEffect, Fragment } from "react";
import { useDispatch } from "react-redux";
import { followingActions } from "../../store";
import Head from "next/head";

const profile = ({ token }) => {
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

    return (
        <Fragment>
            <Head>
                <title>Your profile | Twizzer</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="p-4 mt-4 rounded-3 alert alert-light">
                <Information token={token} />
                <hr />
                <Posts token={token} />
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

export default profile;
