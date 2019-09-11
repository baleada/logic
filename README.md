# @baleada/logic

JavaScript libraries that implement UI logic for the Baleada toolkit


## Purpose

Provide a predictable, intuitive API for complex, common UI logic.


## Rules followed by Baleada's libraries

- Every library is a JavaScript class.
- Classes' constructors accepts two parameters: a piece of state, and an `options` object.
- Classes store a shallow copy of their constructors' state in a public property named after the state's type (e.g. `string`, `array`).
- Classes have one or more public properties, one or more public methods, and one or more public getters.
- Classes store their constructors' options in private properties.
- Each class has public methods that allow users to write new values to public properties. Those methods follow a naming convention of `set<PropertyName>`. Outside of those methods, classes never write to their own public properties (e.g. by calling `set<PropertyName>` inside another method).
- Some classes have public methods that mutate the core `<state>` property. When this is the case, the class will accept an `on<Method>` option, where `Method` is the name of the public method that mutates the core `<state>`. Instead of actually mutating `<state>`, the class will shallow copy `<state>`, mutate it, and pass that state as the first argument of any function passed by the user to the `on<Method>` option.
- Classes' public methods can be chained (all public methods return `this`, i.e. the instance).

- Classes' names ends in -able or -ible
- Classes property names, getter names, and method names are camelCased


### Open questions

#### When do classes have public properties other than the core `<state>` property?

#### When do classes have public getters?
- Affordance


## Snippets

### Library

```js
/*
 * ${1:Library}.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */

export default class ${1:Library} {
  constructor(${2:state}, options = {}) {
    /* Options */

    /* Public properties */
    this.${2:state} = ${2:state}

    /* Private properties */

    /* Dependency */
  }

  /* Public getters */

  /* Public methods */
  set${3:ProperCaseState}(${2:state}) {
    this.${2:state} = ${2:state}
    return this
  }

  /* Private methods */

}
```

### getDependencyOptions

```js
#get${1:Dependency}Options = ({ ${2:options}, ...rest }) => rest
```

### Node environment test

```js

```

### Browser environment test

```js

```
