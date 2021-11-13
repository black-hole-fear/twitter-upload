import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";

const PopularTag = ({ token }) => {
    const [popularTags, setPopularTags] = useState([]);
    useEffect(async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/tag/get-popular-tag", {
                headers: {
                    Authorization: "Bearer " + token,
                },
            });
            setPopularTags(res.data.tags);
        } catch (e) {
            console.log(e);
        }
    }, []);

    return (
        <div className="p-4 mt-4 bg-light rounded-3 shadow-sm">
            <p className="fs-4 text-secondary">Popular tags</p>
            <div className="p-1">
                {popularTags.map((tag, index) => {
                    return (
                        <div key={index} className="my-1 border-bottom">
                            <Link href={`/tag/${tag._id}`}>
                                <a
                                    className="d-flex align-items-center"
                                    style={{ textDecoration: "none" }}
                                >
                                    <div className="ps-2">
                                        <p className="fw-bolder text-dark">
                                            {index + 1}. #{tag.tag_name}<br /><span className="fw-normal fst-italic">{tag.number} posts</span>
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

export default PopularTag;
