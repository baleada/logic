import re from './re.js'

const guardsByCategory = new Map([
  [
    'recognizeable',
    type => type === 'recognizeable'
  ],
  [
    'observation',
    type => re.observation.test(type)
  ],
  [
    'mediaquery',
    type => re.mediaQuery.test(type)
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
    type => re.keycombo.test(type)
  ],
  [
    'leftclickcombo',
    type => re.leftclickcombo.test(type)
  ],
  [
    'rightclickcombo',
    type => re.rightclickcombo.test(type)
  ],
  [
    'event',
    () => true
  ]
])

export default function toCategory (type) {
  return [...guardsByCategory.keys()]
    .find(category => guardsByCategory.get(category)(type))
}
