/* global Roles */
import { Meteor } from 'meteor/meteor';
import { ROLES } from '../../lib/constants.js';

export const authGuard = (context, redirect) => {
    if (!Meteor.userId()) {
        redirect('/');
    }
};

export const adminRoleGuard = (context, redirect) => {
    const user = Meteor.user();

    if (!Roles.userIsInRole(user, ROLES.ADMIN)) {
        redirect('/');
    }
};

export const blockAdminPortalInCordova = (context, redirect) => {
    // Do not allow administration portal in mobile app.
    // Admin should use the app as normal user.
    if (Meteor.isCordova) {
        redirect('/app');
    }
};

export const blockAppAreaInWeb = (context, redirect) => {
    // App (as normal user) is not allowed in Web
    if (!Meteor.isCordova) {
        redirect('/ban-access');
    }
};
