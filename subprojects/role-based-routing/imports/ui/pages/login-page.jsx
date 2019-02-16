import { Meteor } from 'meteor/meteor';
import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';

export class LoginPage extends React.Component {
    state = {
        username: '',
        password: ''
    };

    onUsernameUpdate = event => this.setState({ username: event.target.value });

    onPasswordUpdate = event => this.setState({ password: event.target.value });

    onFormSubmit = event => {
        event.preventDefault();
        const { username, password } = this.state;

        Meteor.loginWithPassword(username, password, error => {
            if (!error) {
                FlowRouter.go('/');
            } else {
                console.log(error);
            }
        });
    };

    render() {
        const { username, password } = this.state;
        return (
            <div>
                <h1>Login Page</h1>
                <form onSubmit={this.onFormSubmit}>
                    <label htmlFor="username">
                        Username: <br />
                        <input
                            style={{ backgroundColor: 'lightgray' }}
                            id="username"
                            value={username}
                            type="text"
                            onChange={this.onUsernameUpdate}
                        />
                    </label>
                    <br />
                    <label htmlFor="password">
                        Password: <br />
                        <input
                            style={{ backgroundColor: 'lightgray' }}
                            id="password"
                            value={password}
                            type="password"
                            onChange={this.onPasswordUpdate}
                        />
                    </label>
                    <br />
                    <button type="submit">Login</button>
                </form>
            </div>
        );
    }
}
