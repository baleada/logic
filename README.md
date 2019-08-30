# @baleada/logic

JavaScript libraries that implement UI logic for the Baleada toolkit


## Purpose

Provide a predictable, intuitive API for complex, common UI logic.


## Rules followed by Baleada's libraries

- Every library is a JavaScript class.
- Classes' constructors accepts two parameters: a piece of state, and an `options` object.
- Classes store a shallow copy of their constructors' state in a public property named after the state's type (e.g. `string`, `array`).

- Classes have one or more public properties and one or more public methods, and some classes have public getters.
- Classes store their constructors' options in private properties.
- Each class has public methods that allow users to write new values to public properties. Those methods follow a naming convention of `set<PropertyName>`. Outside of those methods, classes never write to their own public properties (e.g. by calling `set<PropertyName>` inside another method).
- Some classes have public methods that mutate the core `<state>` property. When this is the case, the class will accept an `on<Event>` option. Instead of mutating `<state>` directly, the class will pass the mutated state as the first argument of any function passed by the user to the `on<Event>` option.
- Classes' public methods can be chained (all public methods return `this`, i.e. the instance).

- Classes' names ends in -able or -ible
- Classes property names, getter names, and method names are camelCased



### Open questions

#### When do classes have public properties other than the core `<state>` property?

#### When do classes have public getters?
- Affordance
