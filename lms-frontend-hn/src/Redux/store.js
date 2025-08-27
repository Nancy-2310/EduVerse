import { configureStore } from "@reduxjs/toolkit";

import authReducer from './Slices/AuthSlice';
import courseSliceReducer from './Slices/CourseSlice';
import lectureSliceReducer from './Slices/LectureSlice';
import razorpaySliceReducer from './Slices/RazorpaySlice';
import statSliceReducer from './Slices/StatSlice';


const store = configureStore({
    reducer: {
        auth: authReducer,
        course: courseSliceReducer,
        razorpay: razorpaySliceReducer,
        lecture: lectureSliceReducer,
        stat: statSliceReducer
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for file uploads
        ignoredActions: ['auth/signup/pending', 'auth/signup/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['payload.user.avatar'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.data.avatar'],
      },
    }),
    devTools: true
});

export default store;

