import { createSlice, configureStore} from "@reduxjs/toolkit";

const initialFollowingState = {
    following: [],
}

const initialProfileState = {
    name: "",
    profile_image: ""
}

const followingSlice = createSlice({
    name: "following",
    initialState: initialFollowingState,
    reducers: {
        setInitialFollowing(state, action) {
            state.following = action.payload.followingFetched;
        },
        addFollowing(state, action) {
            const newFollowing = action.payload.following;
            state.following.push(newFollowing);
        },
        removeFollowing(state, action) {
            const filtered = state.following.filter((f, index) => f != action.payload.following);
            state.following = filtered;
        },
        removeAllFollowing(state, action) {
            state.following = [];
        }
    }
})

const profileSlice = createSlice({
    name: "profile",
    initialState: initialProfileState,
    reducers: {
        setInitialProfile(state, action) {
            state.name = action.payload.name;
            state.profile_image = action.payload.profile_image;
        },
        updateProfile(state, action) {
            state.name = action.payload.name;
            if(action.payload.profile_image) {
                state.profile_image = action.payload.profile_image;
            }
        }
    }
})

const store = configureStore({
    reducer: {
        followingSlice: followingSlice.reducer,
        profileSlice: profileSlice.reducer,
    }
})

export default store;
export const followingActions = followingSlice.actions;
export const profileActions = profileSlice.actions;