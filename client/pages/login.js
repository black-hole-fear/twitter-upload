import { Fragment } from "react";
import LoginForm from "../components/Login/LoginForm";
import Head from "next/head";

const login = () => {
    return (
        <Fragment>
            <Head>
                <title>Login | Twizzer</title>
                <meta name="description" content="Twizzer login" />
            </Head>
            <div className="container mx-auto pt-5">
                <div className="border border-2 p-5 w-50 mx-auto rounded-3 shadow bg-light mt-2">
                    <LoginForm />
                </div>
            </div>
        </Fragment>
    );
};

export const getServerSideProps = (ctx) => {
    if (ctx.req.headers.cookie) {
        return {
            redirect: {
                permanent: false,
                destination: "/",
            },
        };
    } else {
        return {
            props: {}
        };
    }
};

export default login;
