import NewPassword from "../../components/ForgetPassword/NewPassword";
import Head from "next/head";
import jwt from "jsonwebtoken";
import { Fragment } from "react";

const NewPasswordPage = ({ token, email }) => {
    return (
        <Fragment>
            <Head>
                <title>Reset password | Twizzer</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="p-5 bg-light rounded-3">
                <h1 className="display-3 mb-4">New password</h1>
                <NewPassword email={email} token={token} />
            </div>
        </Fragment>
    );
};

export const getServerSideProps = (ctx) => {
    try {
        const token = ctx.params.token;
        const { email } = jwt.decode(token);
        return {
            props: {
                token,
                email,
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

export default NewPasswordPage;
