import axios from "axios";
import { Fragment } from "react";
import Head from "next/head";

const index = () => {
    return (
        <Fragment>
            <Head>
                <title>Admin | Twizzer Admin</title>
                <meta name="description" content="Twizzer" />
            </Head>
            <div className="m-4 p-3 alert alert-light">
                <p className="display-2">Hi, Admin</p>
                <div className="p-3">
                    <span>
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Perferendis magnam
                        quasi molestias minus ipsum expedita illum earum ipsa ullam enim, alias
                        iusto, aperiam quas hic quod aut nostrum fugiat? Saepe deserunt nihil
                        veritatis ullam, fuga harum cum accusamus officia facere voluptate iusto!
                        Nostrum accusantium facilis, delectus maiores nemo molestias alias.
                    </span>
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
        const res = await axios.get("http://localhost:8000/api/check-admin", {
            headers: {
                Authorization: "Bearer " + token,
            },
        });
        return {
            props: {},
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

export default index;
