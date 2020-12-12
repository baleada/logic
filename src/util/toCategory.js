import re from './re.js'

assertionsByCategory = new Map([
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
  const { 0: category } = assertionsByCategory
    .entries()
    .find(({ 1: assertion }) => assertion(type))
  return category
}
