import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";

const PopularUser = ({ token }) => {
    const [popular, setPopular] = useState([]);

    useEffect(async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/user/popular-user", {
                headers: {
                    Authorization: "Bearer " + token,
                },
            });
            setPopular(res.data.popular);
        } catch (e) {
            console.log(e);
        }
    }, []);

    return (
        <div className="p-4 bg-light rounded-3 shadow-sm">
            <p className="fs-4 text-secondary">Recommended users</p>
            <div className="p-1">
                {popular.map((user, index) => {
                    return (
                        <div key={index} className=" my-1 border-bottom">
                            <Link href={`/profile/${user.user.username}`}>
                                <a
                                    className="d-flex align-items-center"
                                    style={{ textDecoration: "none" }}
                                >
                                    <img
                                        src={(user.profile_image.url === "") ? "/static/images/unknown-profile.jpg": user.profile_image.url}
                                        alt="profile"
                                        className="rounded-pill"
                                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "50%"}}
                                    />
                                    <div className="ps-2">
                                        <p className="fw-bold text-dark">
                                            {index + 1}. {user.user.name}<br /><span className="text-secondary fw-normal">@{user.user.username}</span>
                                        </p>
                                    </div>
                                </a>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PopularUser;
