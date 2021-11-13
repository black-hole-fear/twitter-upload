import ChangePassword from "../../components/Profile/ChangePassword";
import axios from "axios";
import Head from "next/head";
import { Fragment } from "react";

const ChangPasswordPage = ({ token }) => {
    return (
        <Fragment>
            <Head>
                <title>Change password | Twizzer</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="p-5 bg-light rounded-3">
                <h1 className="display-3 mb-4">Change password</h1>
                <ChangePassword token={token} />
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

export default ChangPasswordPage;
