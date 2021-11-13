const express = require("express");
const router = express.Router();
const { editProfileValidator } = require("../validators/profile-validator");
const {passwordValidator} = require("../validators/auth-validator");
const { runValidation } = require("../validators/index");
const { requireSignIn, checkIsUser } = require("../controllers/auth");
const {
    getProfile,
    editProfile,
    getPopularUser,
    changePassword,
    getUserAutocomplete,
    getUserSearching,
    getUserProfile,
    getFollowingUser,
    requestToFollow,
    unFollow,
    fetchFollowing,
    fetchFollower,
    acceptRequest,
    declineRequest,
    removeFollower,
    getInitialProfile,
} = require("../controllers/user");

router.get("/user/get-profile", requireSignIn, getProfile);

router.get("/user/get-initial-profile", requireSignIn, checkIsUser, getInitialProfile);

router.post(
    "/user/edit-profile",
    requireSignIn,
    checkIsUser,
    editProfileValidator,
    runValidation,
    editProfile,
);
router.get("/user/popular-user", requireSignIn, checkIsUser, getPopularUser);

router.post("/user/change-password", requireSignIn, checkIsUser, passwordValidator, runValidation, changePassword)

router.post("/user/user-autocomplete", requireSignIn, checkIsUser, getUserAutocomplete);

router.post("/user/user-searching", requireSignIn, checkIsUser, getUserSearching);

router.post("/user/user-profile", requireSignIn, checkIsUser, getUserProfile);

router.get("/user/get-following", requireSignIn, checkIsUser, getFollowingUser)

router.post("/user/follow", requireSignIn, checkIsUser, requestToFollow);

router.post("/user/un-follow", requireSignIn, checkIsUser, unFollow)

router.post("/user/fetch-following", requireSignIn, checkIsUser, fetchFollowing);

router.post("/user/fetch-follower", requireSignIn, checkIsUser, fetchFollower)

router.post("/user/accept-request", requireSignIn, checkIsUser, acceptRequest)

router.post("/user/decline-request", requireSignIn, checkIsUser, declineRequest)

router.post("/user/remove-follower", requireSignIn, checkIsUser, removeFollower)

module.exports = router;
