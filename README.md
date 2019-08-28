# @baleada/logic

JavaScript libraries that implement UI logic for the Baleada toolkit


## Purpose

Provide a predictable, intuitive API for complex, common UI logic.


## Rules followed by Baleada's libraries

- Every library is a JavaScript class.
- Classes' constructors accepts two parameters: a piece of state, and an `options` object.
- Classes store a shallow copy of their constructors' state in a public property named after the state's type (e.g. `string`, `array`).
<!-- - When do classes have public properties other than that one? -->
- Classes have one or more public properties and one or more public methods, and some classes have public getters.
- Classes store their constructors' options in private properties.
- Each class has public methods that allow users to write new values to public properties. Those methods follow a naming convention of `set<PropertyName>`. Outside of those methods, classes do not write to their own public properties.
- Classes' public methods can be chained (all public methods return `this`, i.e. the instance).

- Classes' names ends in -able or -ible
- Classes property names, getter names, and method names are camelCased
