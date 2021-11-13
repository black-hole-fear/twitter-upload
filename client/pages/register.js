import { Fragment } from "react";
import RegisterForm from "../components/Register/RegisterForm";
import Head from "next/head";

const register = () => {
    return (
        <Fragment>
            <Head>
                <title>Register | Twizzer</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="container mx-auto pt-3">
                <div className="border p-5 w-50 mx-auto rounded shadow bg-light mt-3">
                    <RegisterForm />
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
    }
    return {
        props: {}
    }
};

export default register;
