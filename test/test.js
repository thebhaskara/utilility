describe('Utility', function() {

    var callbacks = new Utility.Callback();
    var tracker = {};

    var getTrackerCallback = function(key) {
        return function() {
            var t = tracker[key] || (tracker[key] = { args: [] });
            t.args.push(arguments);
        }
    };

    describe('Callback', function() {
        it('should create a new object', function(done) {
            tryCatch(function() {

                callbacks = new Utility.Callback();

                expect(!!callbacks).to.eql(true);

            }, done);
        });

        it('should be able to add callback before execution', function(done) {
            tryCatch(function() {

                callbacks.add(getTrackerCallback('beforeExecuteCallback'));

                expect(callbacks.callbacks.length).to.eql(1);

            }, done);
        });

        it('should be able to run callback', function(done) {
            tryCatch(function() {

                var args = [];
                callbacks.run.apply(callbacks, args);

                expect({
                    count: tracker['beforeExecuteCallback'].args.length,
                    args: tracker['beforeExecuteCallback'].args[0].length,
                }).to.eql({
                    count: 1,
                    args: 0,
                });


            }, done);
        });

        it('should be able to run callback added after execution, ' +
            'without rerunning the previously added callback',
            function(done) {
                tryCatch(function() {

                    callbacks.add(getTrackerCallback('afterExecuteCallback'));

                    expect({
                        beforeCount: tracker['beforeExecuteCallback'].args.length,
                        beforeArgs: tracker['beforeExecuteCallback'].args[0].length,
                        afterCount: tracker['afterExecuteCallback'].args.length,
                        afterArgs: tracker['afterExecuteCallback'].args[0].length,
                    }).to.eql({
                        beforeCount: 1,
                        beforeArgs: 0,
                        afterCount: 1,
                        afterArgs: 0,
                    });

                }, done);
            });

        var args2 = ['argument1'];
        it('when run again should be calling all the callbacks, with a different set of arguments', function(done) {
            tryCatch(function() {

                callbacks.run.apply(callbacks, args2);

                expect({
                    beforeCount: tracker['beforeExecuteCallback'].args.length,
                    beforeArgs: tracker['beforeExecuteCallback'].args[0].length,
                    beforeArgs2: tracker['beforeExecuteCallback'].args[1].length,
                    beforeArgs2Value: tracker['beforeExecuteCallback'].args[1][0],
                    afterCount: tracker['afterExecuteCallback'].args.length,
                    afterArgs: tracker['afterExecuteCallback'].args[0].length,
                    afterArgs2: tracker['afterExecuteCallback'].args[1].length,
                    afterArgs2Value: tracker['afterExecuteCallback'].args[1][0],
                }).to.eql({
                    beforeCount: 2,
                    beforeArgs: 0,
                    beforeArgs2: 1,
                    beforeArgs2Value: args2[0],
                    afterCount: 2,
                    afterArgs: 0,
                    afterArgs2: 1,
                    afterArgs2Value: args2[0],
                });


            }, done);
        });

        it('when a new callback is added after running twice, the added callback should be ran twice', function(done) {
            tryCatch(function() {

                callbacks.add(getTrackerCallback('afterExecuteCallbackTwice'));

                expect({
                    beforeCount: tracker['beforeExecuteCallback'].args.length,
                    beforeArgs: tracker['beforeExecuteCallback'].args[0].length,
                    beforeArgs2: tracker['beforeExecuteCallback'].args[1].length,
                    beforeArgs2Value: tracker['beforeExecuteCallback'].args[1][0],
                    afterCount: tracker['afterExecuteCallback'].args.length,
                    afterArgs: tracker['afterExecuteCallback'].args[0].length,
                    afterArgs2: tracker['afterExecuteCallback'].args[1].length,
                    afterArgs2Value: tracker['afterExecuteCallback'].args[1][0],
                    afterTwiceCount: tracker['afterExecuteCallbackTwice'].args.length,
                    afterTwiceArgs: tracker['afterExecuteCallbackTwice'].args[0].length,
                    afterTwiceArgs2: tracker['afterExecuteCallbackTwice'].args[1].length,
                    afterTwiceArgs2Value: tracker['afterExecuteCallbackTwice'].args[1][0],
                }).to.eql({
                    beforeCount: 2,
                    beforeArgs: 0,
                    beforeArgs2: 1,
                    beforeArgs2Value: args2[0],
                    afterCount: 2,
                    afterArgs: 0,
                    afterArgs2: 1,
                    afterArgs2Value: args2[0],
                    afterTwiceCount: 2,
                    afterTwiceArgs: 0,
                    afterTwiceArgs2: 1,
                    afterTwiceArgs2Value: args2[0],
                });

            }, done);
        });
    });
});
