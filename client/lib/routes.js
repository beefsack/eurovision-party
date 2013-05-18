Meteor.Router.add({
	'/loading': 'loading',
	'/parties/new': 'partiesNew',
	'/parties/create': 'partiesCreate',
	'/parties/:_id/users': {
		to: 'partiesUsers',
		and: function(id) {
			Session.set('partyId', id);
		}
	},
	'/parties/:_id': {
		to: 'partiesShow',
		and: function(id) {
			Session.set('partyId', id);
		}
	},
	'/parties': 'partiesIndex',
	'/admin': 'adminIndex',
	'/': 'home',
	'*': 'notFound'
});

Meteor.Router.filters({
	requireAdmin: function(page) {
		if (Meteor.user().profile.admin) {
			return page;
		}
		return 'accessDenied';
	},
	canCreateParty: function(page) {
		if (Ability.canCreateParty(Meteor.user())) {
			return page;
		}
		return 'accessDenied';
	}
});

Meteor.Router.filter('requireAdmin', {
	only: [
		'adminIndex'
	]
});
Meteor.Router.filter('canCreateParty', {
	only: [
		'partiesNew',
	]
});
