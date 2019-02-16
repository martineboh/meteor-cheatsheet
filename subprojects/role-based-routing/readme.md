# Role Based routing with Flow Router

This is a sample project / guide on setting up a Meteor app with top level routing based on the role of the user.

## Overview

The app based on the following concepts.
* Users can be 'normal' users, or can have an `admin` role.
* The app has top level parts (routes).
    * Public area: Can be accessed by anyone, in order to authenticate
    * App area: This is the normal usage of the app that can be used both types of users.
    * Admin Portal area: This area should be accessible only by users with `admin` role.
* In addition:
    * Public area is available both on web and cordova platforms
    * Admin Portal is availble only in Web platform. `admin` users that login in Cordova environment are redirected to App area.
    * App area is only available on Cordova platform. If any user tries to access it on Web, the user is redirected to a 'block' page.

The app can be adapted to switch various other cases, like adding more roles or removing the above restrictions.

## Packages used

The app is based on the following `atmosphere.js` packages.

* `alanning:roles` for managing roles of users
* `kadira:flow-router` for routing.

It is based on _React_ but it can easily be adapted to _Blaze_ templates.

## Router init after subscriptions complete

A basic concept that it demonstrates is how to 'stall' the router initialization until the needed subscriptions are finished. This is because we need specific information fetched from database before making a routing decision.

In the example below, the router initialization waits for 3 subscriptions to finish.

* The `me` subscription: It fetches our full _user document_ with all necessary fields.
* The `Roles.subscription`: This subscription is created by the `alanning:roles` package. In this case is not necessary since we have the `me` subscription. It is put here as demo. In only the `roles` field is needed to make routing decision, the `me` subscription can be skipped.
* The `companies` subscription: This demonstrates the case were there is need for other subscriptions needed for the routing decision. Again it is put here as demo, because it is not actually used in the routing decision.

Finally before the router is initialized, a check is performed in case it already has been initialized.

**routes.js**
```
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
```

## The top-level areas

We app is 'partitioned' in 3 areas.
* Public Area: which will contain pages accessible by unauthenticated users. In this example, it has only one route. It is the `/login` which renders the Login page.
* App area (`/app`): This area offers the App's functionality for normal users.
* Admin area (`/admin`): This area is the Admin Portal of the app. It should be accessible only by users with `admin` role.

These areas are translated in routes definitions as _FlowRouter_ `groups`.

**routes.js**
```
const publicRoutes = FlowRouter.group({
    name: 'publicRoutes'
});

const appRoutes = FlowRouter.group({
    prefix: '/app',
    name: 'appRoutes',
});

const adminRoutes = FlowRouter.group({
    prefix: '/admin',
    name: 'adminRoutes',
});
```

And the corresponding routes (only one page per area in this demo.)

**routes.js**
```
publicRoutes.route('/login', {
    action() {
        mount(LoginPage);
    }
});

appRoutes.route('/', {
    action() {
        mount(DummyPage, { title: 'App for Users' });
    }
});

adminRoutes.route('/', {
    action() {
        mount(DummyPage, { title: 'Portal for Admins' });
    }
});
```

# The root '/' path

The app's entry point will be the root (`/`) path. So this path is not part of any `group` (or area). Is it used for entry point decision. It lands the user on the proper area based on the user's authentication status and role.

**router.js**
```
FlowRouter.route('/', {
    action() {
        FlowRouter.go(getRouteBasedOnRole());
    }
});
```

**role-routing.js**
```
export const getRouteBasedOnRole = () => {
    const user = Meteor.user();

    // land unauthenticated users on login page
    if (!user) {
        return '/login';
    }

    // land Admins on Admin Portal
    if (Roles.userIsInRole(user, ROLES.ADMIN)) {
        return '/admin';
    }

    // No ROLE means normal user. Land on App area
    return '/app';
};
```

## Route Guards

So the app's entry will land user normally. But in case of web, user can directly enter the URL paths to land on. Protection is needed on pages from unauthorized access (authentication status and roles) and not-supported access (area app vs platform; remember that certain parts of the app should be available only on specific platforms).

The approach here is to write _guard_ functions that will check specific conditions and block access to the route, by redirecting to the user elsewhere.

These functions will be bound to route `groups` by using the `triggersEnter` hooks of _FlowRouter_.

One _guard_ function per case is created and then it is 'hooked' into the necessary routes group. Care must be taken in the order in which the _guards_ are applied. It is important for delivering the guarding logic (review again the requirements at the start of this document).

If all the _guards_ are executed and no `redirect` happens, then the route will be entered.

So the route groups now become:

**routes.js**
```
const appRoutes = FlowRouter.group({
    prefix: '/app',
    name: 'appRoutes',
    triggersEnter: [authGuard, blockAppUsageInWeb]
});


const adminRoutes = FlowRouter.group({
    prefix: '/admin',
    name: 'adminRoutes',
    triggersEnter: [authGuard, adminRoleGuard, blockAdminPortalInCordova]
});
```

### The route guards in detail

The `triggersEnter` hooks are calling the _guard_ functions with two parameters.
* `context` which contains the current route properties
* `redirect`. A function that can be used to redirect the browser to a new route.

Notice, that when a user is 'kicked out' of a route, the user is `redirected` to root route (`/`) so the proper routing decision is taken. This way the routing logic does not have to be implemented in each _guard_. Care must be taken though, so no 'loops' are created.

**_authGuard_**

If the user is not authenticated, is kicked out of the route
```
export const authGuard = (context, redirect) => {
    if (!Meteor.userId()) {
        redirect('/');
    }
};
```

**_adminRoleGuard_**

If the user has not the `admin` role, is kicked out of the route.
```
export const adminRoleGuard = (context, redirect) => {
    const user = Meteor.user();

    if (!Roles.userIsInRole(user, ROLES.ADMIN)) {
        redirect('/');
    }
};
```

**_blockAdminPortalInCordova_**

This _guard_ is used in Admin Portal group and after the user has been evaluated for the `admin` role. So if the `admin` user is in mobile platform, then redirect to App area, in order to use the app as normal user.
```
export const blockAdminPortalInCordova = (context, redirect) => {
    if (Meteor.isCordova) {
        redirect('/app');
    }
};
```

Note: The user is not redirected to `/` because the root logic will land him again in this area.

**_blockAppAreaInWeb_**

This _guard_ is used in App area. If the platform is web, the user is not allowed to use. The user is not redirected to `/` because the logic will land him again here. Thus the user is redirected in a 'block' page, to be informed that the usage is not allowed in web-platform.
```
export const blockAppAreaInWeb = (context, redirect) => {
    // App (as normal user) is not allowed in Web
    if (!Meteor.isCordova) {
        redirect('/ban-access');
    }
};
```

