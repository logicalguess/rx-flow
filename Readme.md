# Interaction Flows with RxJs

Definition (it works on any object):

      function createFlow(context, fnName, input, output, promiseProvider, procFn) {
           createObservableFunction(context)(fnName)
                .map(function () { return context[input]; })
                 .flatMapLatest(promiseToObservable(promiseProvider, procFn))
                  .subscribe(function(results) {
                       context[output] = results;
                   });
       }

This will add a function <code>click</code> on the scope, whose invocation will trigger a flow that will use the
<code>input</code> data and the promiseProvider to create a promise whose results will be used to populate the
<code>output</code> field, after transforming the promise value with the <code>procFn</code> function.

Usage with AngularJs:

     createFlow($scope, 'click', 'search', 'results', dataProvider, function(response) {return response.data[1]});

Angular's two-way binding is nicely complementing the interaction flow.

Such dynamic flows could be used to implement interaction contexts and roles in DCI. The <code>combineLatest</code>
operator of <code>Observables</code> could be used to support multiple inputs.