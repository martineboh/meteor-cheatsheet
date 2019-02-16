import { Meteor } from 'meteor/meteor';
import { Companies } from './companies-collection.js';

Meteor.publish('companies', function() {
    return Companies.find({});
});
