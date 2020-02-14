import axios from 'axios';

export const FETCH_USERS = 'fetch_users';
export const fetchUsers = () => async (dispatch, getState, api) => {
  await new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 3000);
  });
  
  const res = await api.get('/users');

  dispatch({
    type: FETCH_USERS,
    payload: res
  });
};

export const FETCH_POSTS = 'fetch_posts';
export const fetchPosts = () => async (dispatch, getState, api) => {
  await new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
  
  const res = await axios.get('https://jsonplaceholder.typicode.com/posts');

  dispatch({
    type: FETCH_POSTS,
    payload: res
  });
};

export const FETCH_CURRENT_USER = 'fetch_current_user';
export const fetchCurrentUser = () => async (dispatch, getState, api) => {
  const res = await api.get('/current_user');

  dispatch({
    type: FETCH_CURRENT_USER,
    payload: res
  });
};

export const FETCH_ADMINS = 'fetch_admins';
export const fetchAdmins = () => async (dispatch, getState, api) => {
  const res = await api.get('/admins');

  dispatch({
    type: FETCH_ADMINS,
    payload: res
  });
};
