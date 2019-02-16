/* global Migrations */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

Migrations.add({
    version: 3,
    name: '3rd Collection',
    up() {
        const Companies = new Mongo.Collection('companies');
        [
            {
                company: 'Acme Co',
                members: ['johndoe@mailinator.com']
            },
            { company: 'Wayne Co', members: ['admindoe@mailinator.com'] }
        ].forEach(company => {
            const members = Meteor.users
                .find({
                    emails: {
                        $elemMatch: { address: { $in: company.members } }
                    }
                })
                .fetch();
            Companies.update(
                { name: company.name },
                {
                    $set: {
                        name: company.name,
                        members: members.map(member => member._id)
                    }
                },
                { upsert: true }
            );
        });
    }
});
