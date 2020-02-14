import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchUsers, fetchPosts } from "../actions";
import { Helmet } from "react-helmet";

class UsersList extends Component {
  componentDidMount() {
    if (this.props.users.length < 1) {
      this.props.fetchUsers();
    }

    if (this.props.posts.length < 1) {
      this.props.fetchPosts();
    }
  }

  renderUsers() {
    if (this.props.users.length < 1) {
      return (
        <div className="progress">
          <div className="indeterminate"></div>
        </div>
      );
    }

    return this.props.users.map(user => {
      return <li key={user.id}>{user.name}</li>;
    });
  }

  renderPosts() {
    if (this.props.posts.length < 1) {
      return (
        <div className="row">
          <div className="col s12 m6">
            <div className="card blue-grey darken-1">
              <div className="card-content white-text">
                <div className="progress">
                  <div className="indeterminate"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.posts.slice(0, 10).map(({ id, title, body }) => {
      return (
        <li key={id}>
          <div className="row">
            <div className="col s12 m6">
              <div className="card blue-grey darken-1">
                <div className="card-content white-text">
                  <span className="card-title">{title}</span>
                  <p>{body}</p>
                </div>
              </div>
            </div>
          </div>
        </li>
      );
    });
  }

  head() {
    return (
      <Helmet>
        <title>Users Page</title>
        <meta property="og:title" content="Users App" />
      </Helmet>
    );
  }

  render() {
    return (
      <div>
        {this.head()}
        <h3>Users list:</h3>
        <div className="row">
          <div className="col s12 m6">
            <div className="card blue-grey darken-1">
              <div className="card-content white-text">
                <ul>{this.renderUsers()}</ul>
              </div>
            </div>
          </div>
        </div>
        <hr />
        <h3>Posts list:</h3>
        <ul>{this.renderPosts()}</ul>
      </div>
    );
  }
}

function mapStateToProps({ users, posts }) {
  return { users, posts };
}

function loadData({ dispatch }) {
  return [dispatch(fetchUsers()), dispatch(fetchPosts())];
}

export default {
  loadData,
  component: connect(mapStateToProps, { fetchUsers, fetchPosts })(UsersList)
};
