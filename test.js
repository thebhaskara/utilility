var Utility = require('./utility');

var callbacks = new Utility.Callback();

setTimeout(function() {
    console.log('executing');
    callbacks.execute('bhaskara', 'rama');
}, 1000);

setTimeout(function() {
    callbacks.add(function(bhaskara, rama) {
        console.log('callback added after execution', bhaskara, rama);
    });
}, 3000);

callbacks.add(function(bhaskara, rama) {
    console.log('callback added before execution', bhaskara, rama);
});

var model = new Utility.Model({
	name: {
		first: 'bhaskara',
		last: 'busam'
	},
	age: 23,
	dob: {
		date: 10,
		month: 3,
		year: 2017
	}
});

model.watch('name.first', function(first){
	console.log('logging name.first ' + first);
})

model.set('name.first', 'abba');
model.set('name', {
	first: 'abboo'
});

console.log(model.get('name'));