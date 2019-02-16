/* global Migrations */
import { Accounts } from 'meteor/accounts-base';

Migrations.add({
    version: 1,
    name: 'Initiate users',
    up() {
        ['johndoe@mailinator.com', 'admindoe@mailinator.com'].forEach(email =>
            Accounts.createUser({
                email,
                password: 'p@ssw0rd'
            })
        );
    }
});
