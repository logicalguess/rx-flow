# Interaction Flows with RxJs

Usage:

     createFlow($scope, 'click', 'search', 'results', dataProvider, function(response) {return response.data[1]});

Definition:

      function createFlow(context, fnName, input, output, promiseProvider, procFn) {
           createObservableFunction(context)(fnName)
                .map(function () { return context[input]; })
                 .flatMapLatest(promiseToObservable(promiseProvider, procFn))
                  .subscribe(function(results) {
                       context[output] = results;
                   });
       }