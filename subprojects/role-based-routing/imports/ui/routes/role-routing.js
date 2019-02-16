/* global Roles */
import { Meteor } from 'meteor/meteor';
import { ROLES } from '../../lib/constants.js';

export const getRouteBasedOnRole = () => {
    const user = Meteor.user();

    if (!user) {
        return '/login';
    }

    if (Roles.userIsInRole(user, ROLES.ADMIN)) {
        return '/admin';
    }

    // No ROLE means normal user
    return '/app';
};
