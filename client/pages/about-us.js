import Head from "next/head";
import { Fragment } from "react";

const aboutUs = () => {
    return (
        <Fragment>
            <Head>
                <title>About us | Twizzer</title>
                <meta name="description" content="About Twizzer creators" />
            </Head>
            <div className="p-3">
                <p className="display-3">About us</p>
                <div className="text-center w-100">
                    <img
                        src="https://scontent.fbkk3-3.fna.fbcdn.net/v/t1.6435-9/100577761_2235328466613607_755977036517867520_n.jpg?_nc_cat=103&ccb=1-5&_nc_sid=09cbfe&_nc_eui2=AeEv1Xc1t437Ia3S0t5qLorUlX5Ue-irigqVflR76KuKCq4jUaPiarB4bmbFTTTk_3L7sSOf9BZia0mKgXtspNPG&_nc_ohc=KJqspJ4STwQAX_Blbi6&_nc_ht=scontent.fbkk3-3.fna&oh=39ea88e460377ee6a0e6ad707c2fb0c0&oe=61A07282"
                        alt="progile"
                        style={{ height: "250px" }}
                        className="rounded-pill"
                    />
                </div>
                <div className="p-3">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos dolores
                    quidem quod eveniet recusandae praesentium quam, enim iusto ducimus placeat
                    adipisci minus quibusdam maxime eos saepe tempore reiciendis ullam architecto
                    voluptas vitae quia provident dicta? Expedita quisquam sequi libero, adipisci
                    cum earum necessitatibus fugit error inventore iste quod incidunt totam labore
                    amet veniam quas iure eius dolorem officia quos! A eos odit veniam quasi
                    consectetur veritatis mollitia, sapiente unde, ipsa vero, itaque deserunt. Eius
                    ullam, ipsum voluptates, distinctio quasi alias odio laboriosam cupiditate porro
                    nostrum est rem aspernatur fugit neque quod aliquid laborum praesentium velit
                    exercitationem repellat voluptatum blanditiis ratione.
                </div>
            </div>
        </Fragment>
    );
};

export default aboutUs;
