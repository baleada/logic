const re = {
  observation:
    /^(?:intersect|mutate|resize)$/,
  mediaQuery:
    /^\(.+\)$/,
  keycombo:
    /^((!?([a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]|tab|space|arrow|vertical|horizontal|up|right|down|left|enter|backspace|cmd|shift|ctrl|alt|opt))\+)*(!?([a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]|tab|space|arrow|vertical|horizontal|up|right|down|left|enter|backspace|cmd|shift|ctrl|alt|opt))$/,
  leftclickcombo:
    /^(!?((cmd|shift|ctrl|alt|opt))\+){0,4}(click|mousedown|mouseup)$/,
  rightclickcombo:
    /^(!?((cmd|shift|ctrl|alt|opt))\+){0,4}rightclick$/,
  singleCharacter:
    /^!?[a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]$/,
  arrow:
    /^!?(arrow|vertical|horizontal|up|down|right|left)$/,
  enterBackspaceTabSpace:
    /^!?(enter|backspace|tab|space)$/,
  modifier:
    /^!?(cmd|shift|ctrl|alt|opt)$/,
  click:
    /^(rightclick|click|mousedown|mouseup)$/,
}

export default re
