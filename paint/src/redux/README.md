# Redux Integration

## [ReduxState](./reduxState.js)

For each state root the Redux methods, reducers and action types are stored in a [ReduxState](./reduxState.js) sub-class.

The [ReduxState](./reduxState.js) class provides a reducer method to be used in combineReducers as done in
 [redux/index.js](./index.js). It uses inspection to find all instance methods (provided by a sub-class) which
 also has:
 
 * A {method.name}Reducer: for the [ReduxState](./reduxState.js).reducer() to call.
 * A Redux Action type constant which is an upper case string snake case name. This name may be prefixed with the
 name of the sub-class.
 
 See example code in session.js, options.js, tempValues.js, treeModel.js, and messages.js.



# State Classes (sub-classes of [ReduxState](./reduxState.js))

## [Session](./session.js)
TBD
## [Options](./options.js)
TBD
## [TempValues](./tempValues.js)
TBD
## [TreeModel](./treeModel.js)
TBD
## [Messages](./messages.js)
TBD
 
 
 
 
 
 



