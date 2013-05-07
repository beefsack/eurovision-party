Meteor.Router.add({
	'/': 'home',
	'/parties/new': 'parties_new',
	'*': 'not_found'
});
