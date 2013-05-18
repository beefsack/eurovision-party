Template.partiesUsers.helpers({
	party: function() {
		return Parties.findOne(Session.get('partyId'));
	},
	addableUsers: function() {
		var addedUsers = PartyUsers.find({
			partyId: Session.get('partyId')
		});
		return Meteor.users.find({
			_id: {
				'$nin': addedUsers.map(function(pu) {
					return pu.userId;
				})
			}
		});
	},
	partyUsers: function() {
		return PartyUsers.find({
			partyId: Session.get('partyId')
		});
	},
	userEmails: function() {
		return _.pluck(this.emails, 'address').join(', ');
	}
});

Template.partiesUsers.events({
	'submit #addUserForm': function(event) {
		event.preventDefault();
		Meteor.call('addUserToParty', $('#addUserForm [name=user]').val(),
			Session.get('partyId'), function(error, id) {
				if (error) {
					return alert(error.reason);
				}
				alert('Added user');
			});
	}
});
