import CreateForm from "../../components/Post/CreateForm";
import axios from "axios";
import { Fragment } from "react";
import Head from "next/head";

const create = ({ token }) => {
    return (
        <Fragment>
            <Head>
                <title>Create post | Twizzer</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="p-5 bg-light">
                <div className="mb-2">
                    <p className="display-3">Create post</p>
                </div>
                <div className="p-3">
                    <CreateForm token={token} />
                </div>
            </div>
        </Fragment>
    );
};

export const getServerSideProps = async (ctx) => {
    let token;
    if (ctx.req.headers.cookie) {
        token = ctx.req.headers.cookie.slice(6);
    } else {
        token = 123;
    }
    try {
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

export default create;
