import moment from "moment";
import Link from "next/link";
import axios from "axios";
import { useState, Fragment } from "react";

const Request = ({ notification, token, onAcceptRequestHandler, onDeclineRequestHandler }) => {
    const { from_user, createdAt } = notification;
    const { _id, user, profile_image } = from_user;
    const { name, username } = user;

    return (
        <div className="alert bg-light rounded-3 shadow-sm">
            <Link href={`/profile/${username}`}>
                <a className="d-flex align-items-center" style={{ textDecoration: "none" }}>
                    <img
                        src={
                            profile_image.url === ""
                                ? "/static/images/unknown-profile.jpg"
                                : profile_image.url
                        }
                        style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "50%",
                        }}
                        alt="profile image"
                    />
                    <div className="ms-2">
                        <p className="fw-bold">
                            {name}
                            <span className="text-secondary">
                                {" "}
                                ( @{username} )
                                <span className="text-dark"> request to follow you.</span>
                            </span>
                        </p>
                    </div>
                </a>
            </Link>
            <div className="d-flex p-2">
                <button
                    className="btn btn-outline-success rounded-pill px-4 me-2"
                    onClick={() => onAcceptRequestHandler(notification.from_user, notification._id)}
                >
                    Accept
                </button>
                <button
                    className="btn btn-outline-danger rounded-pill px-4"
                    onClick={() => onDeclineRequestHandler(notification._id)}
                >
                    Decline
                </button>
                <p className="text-dark ms-auto">{moment(createdAt).fromNow()}</p>
            </div>
        </div>
    );
};

export default Request;
