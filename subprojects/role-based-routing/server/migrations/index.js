/* global Migrations */
import { Meteor } from 'meteor/meteor';

import './migration01.js';
import './migration02.js';
import './migration03.js';

Meteor.startup(() => {
    Migrations.migrateTo('latest');
});
