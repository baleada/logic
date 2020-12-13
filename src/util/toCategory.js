export default function toCategory (type) {
  return [...guardsByCategory.keys()]
    .find(category => guardsByCategory.get(category)(type))
}

const observationRE =/^(?:intersect|mutate|resize)$/,
      mediaQueryRE =/^\(.+\)$/,
      keycomboRE =/^((!?([a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]|tab|space|arrow|vertical|horizontal|up|right|down|left|enter|backspace|cmd|shift|ctrl|alt|opt))\+)*(!?([a-zA-Z0-9,<.>/?;:'"[{\]}\\|`~!@#$%^&*()-_=+]|tab|space|arrow|vertical|horizontal|up|right|down|left|enter|backspace|cmd|shift|ctrl|alt|opt))$/,
      leftclickcomboRE =/^(!?((cmd|shift|ctrl|alt|opt))\+){0,4}(click|mousedown|mouseup)$/,
      rightclickcomboRE =/^(!?((cmd|shift|ctrl|alt|opt))\+){0,4}rightclick$/,
      guardsByCategory = new Map([
        [
          'recognizeable',
          type => type === 'recognizeable'
        ],
        [
          'observation',
          type => observationRE.test(type)
        ],
        [
          'mediaquery',
          type => mediaQueryRE.test(type)
        ],
        [
          'idle',
          type => type === 'idle'
        ],
        [
          'visibilitychange',
          type => type === 'visibilitychange'
        ],
        [
          'keycombo',
          type => keycomboRE.test(type)
        ],
        [
          'leftclickcombo',
          type => leftclickcomboRE.test(type)
        ],
        [
          'rightclickcombo',
          type => rightclickcomboRE.test(type)
        ],
        [
          'event',
          () => true
        ]
      ])
