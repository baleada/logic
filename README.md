# JS

JavaScript libraries for the Baleada toolkit


## API pattern

- Every library is a JavaScript class.
- Classes' constructors accepts two parameters: a piece of state, and an `options` object.
- Classes extend native JavaScript prototypes and native Web APIs.
- Classes have public properties and public methods, and some classes have public getters.
- Classes store their constructors' options in private properties.
- Each class has a public `set` method that allows users to create a new instance of the class using new state and the original options.
- Each class has public methods that allow users to write new values to public properties. Outside of those methods, classes do not write to their own public properties.
- Classes' public methods can be chained.

- Classes' names ends in -able or -ible
