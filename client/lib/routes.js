Meteor.Router.add({
	'/loading': 'loading',
	'/parties/new': 'partiesNew',
	'/parties/create': 'partiesCreate',
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
	requireLogin: function(page) {
		if (Meteor.user()) {
			return page;
		} else if (Meteor.loggingIn()) {
			return 'loading';
		}
		return 'accessDenied';
	},
	requireAdmin: function(page) {
		if (Meteor.user().profile.admin) {
			return page;
		}
		return 'accessDenied';
	}
});

Meteor.Router.filter('requireLogin', {
	only: [
		'partiesNew',
		'adminIndex'
	]
});

Meteor.Router.filter('requireAdmin', {
	only: [
		'adminIndex'
	]
});
