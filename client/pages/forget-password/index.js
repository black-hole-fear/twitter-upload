import Email from "../../components/ForgetPassword/Email";
import { Fragment } from "react";
import Head from "next/head";

const ForgetPassword = () => {
    return (
        <Fragment>
            <Head>
                <title>Send email | Twizzer</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="p-5 bg-light rounded-3">
                <h1 className="display-3 mb-4">Forget password</h1>
                <Email />
            </div>
        </Fragment>
    );
};

export default ForgetPassword;
