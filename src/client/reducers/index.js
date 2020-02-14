import { combineReducers } from 'redux';
import usersReducer from './usersReducer';
import authReducer from './authReducer';
import adminsReducer from './adminsReducer';
import postsReducer from './postsReducer';

export default combineReducers({
  users: usersReducer,
  auth: authReducer,
  admins: adminsReducer,
  posts: postsReducer
});
