/* global Migrations, Roles */
import { Meteor } from 'meteor/meteor';
import { ROLES } from '../../imports/lib/constants.js';

Migrations.add({
    version: 2,
    name: 'Assign Roles',
    up() {
        [{ email: 'admindoe@mailinator.com', roles: [ROLES.ADMIN] }].forEach(
            pair => {
                const user = Meteor.users.findOne({
                    emails: { $elemMatch: { address: pair.email } }
                });
                if (user) {
                    Roles.addUsersToRoles(user._id, pair.roles);
                }
            }
        );
    }
});
