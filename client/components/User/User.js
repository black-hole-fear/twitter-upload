import Link from "next/link";
import axios from "axios";
import { useDispatch } from "react-redux";
import { followingActions } from "../../store";

const User = (props) => {
    const dispatch = useDispatch();
    const { user, checkFollowing, token } = props;

    const followHandler = async () => {
        try {
            const res = await axios.post("http://localhost:8000/api/user/follow", {userId: user.user_data._id}, {
                headers: {
                    Authorization: "Bearer " + token,
                }
            })
            alert(res.data.message);
            if(res.data.message === "Followed") {
                dispatch(
                    followingActions.addFollowing({
                        following: user.user_data._id
                    })
                )
            }
        }catch(e) {
            alert(e.response.data.error);
        }
    }

    return (
        <div className="alert alert-light p-3 rounded shadow-sm row">
            <div className="col-md-9">
                <Link href={`/profile/${user.username}`}>
                    <a style={{ textDecoration: "none" }} className="d-flex align-items-center">
                        <img
                            src={
                                user.user_data.profile_image.url === ""
                                    ? "/static/images/unknown-profile.jpg"
                                    : user.user_data.profile_image.url
                            }
                            alt="profile image"
                            style={{
                                width: "75px",
                                height: "75px",
                                borderRadius: "50%",
                                objectFit: "cover",
                            }}
                        />
                        <p className="fw-bold fs-5 ms-2">
                            {user.name}
                            {user.user_data.private && <img src="/static/images/lock-icon.png" className="ms-2" style={{width: "20px"}} />}
                            <br />
                            <span className="text-secondary fw-normal">@{user.username}</span>
                        </p>
                    </a>
                </Link>
            </div>
            <div className="col-md-3 text-end">
                {checkFollowing.includes(user.user_data._id) ? (
                    <p className="fs-5 text-success fw-bold">Following</p>
                ) : (
                    <button className="btn btn-outline-success px-4 rounded-pill" onClick={followHandler}>Follow</button>
                )}
            </div>
        </div>
    );
};

export default User;
