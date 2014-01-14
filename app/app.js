;(function () {

    function promiseToObservable(promiseProvider, procFn) {
        return function() {
            var obs = Rx.Observable.fromPromise(promiseProvider.apply(this, arguments));
            if (procFn) {
                obs = obs.select(procFn)
            }
            return obs;
        };
    }

    function createObservableFunction(context) {
        return function(functionName, listener) {

            return Rx.Observable.create(function (observer) {
                context[functionName] = function () {
                    if (listener) {
                        observer.onNext(listener.apply(this, arguments));
                    } else if (arguments.length === 1) {
                        observer.onNext(arguments[0]);
                    } else {
                        observer.onNext(arguments);
                    }
                };

                return function () {
                    // Remove our listener function from the scope.
                    delete context[functionName];
                };
            });
        }
    }

    function createFlow(context, fnName, input, output, promiseProvider, procFn) {
        createObservableFunction(context)(fnName)
            .map(function () { return context[input]; })
            .flatMapLatest(promiseToObservable(promiseProvider, procFn))
            .subscribe(function(results) {
                context[output] = results;
            });
    }

    angular.module('example', ['rx'])
        .controller('AppCtrl', function($scope, $http, rx) {
            
            function searchWikipedia (term) {
                var deferred = $http({
                        url: "http://en.wikipedia.org/w/api.php?&callback=JSON_CALLBACK",
                        method: "jsonp",
                        params: {
                            action: "opensearch",
                            search: term,
                            format: "json"
                        }
                    });

                return rx.Observable
                    .fromPromise(deferred)
                    .map(function(response){ return response.data[1]; });                
            }

            var dataProvider = function(term) {
                return $http({
                    url: "http://en.wikipedia.org/w/api.php?&callback=JSON_CALLBACK",
                    method: "jsonp",
                    params: {
                        action: "opensearch",
                        search: term,
                        format: "json"
                    }
                });
            };

            $scope.search = '';
            $scope.results = [];

            /*
                The following code deals with:
                 
                Creates a "click" function which is an observable sequence instead of just a function.
            */
//            $scope.$createObservableFunction('click')
//                .map(function () { return $scope.search; })
//                .flatMapLatest(searchWikipedia)
//                .subscribe(function(results) {
//                    $scope.results = results;
//                });

            createFlow($scope, 'click', 'search', 'results', dataProvider, function(response) {return response.data[1]});
        });

}.call());