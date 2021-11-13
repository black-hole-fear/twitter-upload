import { useState, Fragment } from "react";
import jwt from "jsonwebtoken";
import { AlertSuccess, AlertError } from "../../components/Alert/Alert";
import axios from "axios";
import Head from "next/head";
import Router from "next/router";

const ActivatePage = ({ name, token, invalidToken }) => {
    const [status, setStatus] = useState({
        success: "",
        error: "",
    });
    const [buttonText, setButtonText] = useState("Activate");

    const { success, error } = status;

    if (invalidToken) {
        Router.push("/");
    }

    const activateHandler = async () => {
        try {
            const res = await axios.post("http://localhost:8000/api/activate-account", { token });
            setStatus({
                success: res.data.message,
                error: "",
            });
            setButtonText("Activated");
        } catch (e) {
            setStatus({
                success: "",
                error: e.response.data.error,
            });
            setButtonText("Activate");
        }
    };

    let content = (
        <Fragment>
            {success && <AlertSuccess>{success}</AlertSuccess>}
            {error && <AlertError>{error}</AlertError>}
            <p className="display-5">
                Hi, <b>{name}</b>. Please click the below button to activate tour account.
            </p>
            <div className="p-2 w-100 d-flex">
                <button
                    className="btn btn-outline-secondary py-2 mx-auto w-75"
                    onClick={activateHandler}
                >
                    {buttonText}
                </button>
            </div>
            <div className="pt-3 text-center">
                {success && <p className="fw-3 fs-4">Let's login.</p>}
            </div>
        </Fragment>
    );
    if (invalidToken) {
        content = (
            <div className="text-center">
                <p className="fs-3 fw-3">Invalid Token.</p>
            </div>
        );
    }

    return (
        <Fragment>
            <Head>
                <title>Activation account | Twizzer</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="p-5">{content}</div>
        </Fragment>
    );
};

export const getServerSideProps = (ctx) => {
    const token = ctx.params.token;
    if (!jwt.decode(token)) {
        return {
            props: {
                invalidToken: true,
            },
        };
    }
    const { name } = jwt.decode(token);
    return {
        props: {
            token,
            name,
            invalidToken: false,
        },
    };
};

export default ActivatePage;
