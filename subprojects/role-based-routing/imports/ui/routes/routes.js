/* global Roles */
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Tracker } from 'meteor/tracker';
import { mount } from 'react-mounter';

import { DummyPage } from '../pages/dummy-page.jsx';
import { LoginPage } from '../pages/login-page.jsx';

import { getRouteBasedOnRole } from './role-routing.js';
import {
    authGuard,
    adminRoleGuard,
    blockAdminPortalInCordova,
    blockAppAreaInWeb
} from './guards.js';

FlowRouter.wait();

Tracker.autorun(() => {
    const mesub = Meteor.subscribe('me');
    const companiesSubscription = Meteor.subscribe('companies');

    const shouldInitializeRouter =
        mesub.ready() &&
        Roles.subscription.ready() &&
        companiesSubscription.ready() &&
        !FlowRouter._initialized; // eslint-disable-line no-underscore-dangle

    if (shouldInitializeRouter) {
        FlowRouter.initialize();
    }
});

FlowRouter.route('/', {
    action() {
        FlowRouter.go(getRouteBasedOnRole());
    }
});

FlowRouter.route('/ban-access', {
    action() {
        mount(DummyPage, { title: 'You should not be here! ' });
    }
});

const publicRoutes = FlowRouter.group({
    name: 'publicRoutes'
});

publicRoutes.route('/login', {
    action() {
        mount(LoginPage);
    }
});

const appRoutes = FlowRouter.group({
    prefix: '/app',
    name: 'appRoutes',
    triggersEnter: [authGuard, blockAppAreaInWeb]
});

appRoutes.route('/', {
    action() {
        mount(DummyPage, { title: 'App for Users' });
    }
});

const adminRoutes = FlowRouter.group({
    prefix: '/admin',
    name: 'adminRoutes',
    triggersEnter: [authGuard, adminRoleGuard, blockAdminPortalInCordova]
});

adminRoutes.route('/', {
    action() {
        mount(DummyPage, { title: 'Portal for Admins' });
    }
});
