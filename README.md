# JS

JavaScript libraries for the Baleada toolkit


## API pattern

- Every class is an object. Classes do not extend primitives. <!-- TODO: maybe they should -->
- Every class's constructor accepts two parameters: a piece of state, and an `options` object.
- Every class has public properties and public methods, and some classes have public getters. All public properties, methods, and getters are enumerable.
- Every class stores the state from its constructor in a public property.
- Every class stores options from its constructor in private properties.
- Every class has public methods available for writing new values to its public properties. No class writes to its own public properties.
- Each public method in every class returns the instance of that class. This allows for method chaining.

- Every class's name ends in -able or -ible
