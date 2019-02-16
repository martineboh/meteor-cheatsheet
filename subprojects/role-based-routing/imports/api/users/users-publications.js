import { Meteor } from 'meteor/meteor';

Meteor.publish('me', function() {
    return Meteor.users.find(
        { _id: Meteor.userId() },
        { fields: { _id: 1, roles: 1, emails: 1 } }
    );
});
