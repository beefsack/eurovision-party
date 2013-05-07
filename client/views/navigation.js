Template.navigation.myParties = function() {
	return [1];
};

Template.navigation.showMyParties = function() {
	return Template.navigation.myParties().length > 0;
};
