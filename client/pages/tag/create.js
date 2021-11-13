import axios from "axios";
import Create from "../../components/Tag/Create";
import Head from "next/head";
import { Fragment } from "react";

const create = ({ token }) => {
    return (
        <Fragment>
            <Head>
                <title>Create tag | Twizzer</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="p-5 my-5 bg-light rounded-3 shadow-sm">
                <p className="display-3">Create tag</p>
                <div className="p-2">
                    <Create token={token} />
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
                destination: "/",
            },
        };
    }
};

export default create;
