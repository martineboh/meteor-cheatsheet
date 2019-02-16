import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import React from 'react';
import PropTypes from 'prop-types';

const logout = event => {
    event.preventDefault();

    Meteor.logout(error => {
        if (error) {
            console.log(error);
            return;
        }

        FlowRouter.go('/');
    });
};

export const DummyPage = ({ title }) => (
    <div>
        <h1>{title}</h1>
        <button type="button" onClick={logout}>
            Logout
        </button>
    </div>
);

DummyPage.propTypes = {
    title: PropTypes.string.isRequired
};
