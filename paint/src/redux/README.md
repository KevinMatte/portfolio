# Redux Integration

## [ReduxState](./reduxState.js)

For each state root the Redux methods, reducers and action types are stored in a [ReduxState](./reduxState.js) sub-class.

The [ReduxState](./reduxState.js) class provides a reducer method to be used in combineReducers as done in
 [redux/index.js](./index.js). It uses inspection to find all instance methods (provided by a sub-class) which
 also has:
 
 * A {method.name}Reducer: for the [ReduxState](./reduxState.js).reducer() to call.
 * A Redux Action type constant which is an upper case string snake case name. This name may be prefixed with the
 name of the sub-class.
 
 See example code in userSessionState.js, options.js, tempState.js, treeState.js, and messagesState.js.



# State Classes (sub-classes of [ReduxState](./reduxState.js))

## [MessagesState](messagesState.js)
Message queue for UI that user may dismiss.

## [Options](optionsState.js)

Minor UI states. Currently only 'advancedMode' option. Not very useful.

## [TempState](tempState.js)

Temporary states

## [TreeState](treeState.js)

A hierarchical tree of data (Javascript Objects) that can be referenced and updated by paths.

## [UserSessionState](userSessionState.js)

Handles user session services such as login and logout.

 
 
 
 
 
 



