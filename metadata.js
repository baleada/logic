module.exports = {
  "classes": [
    {
      "name": "Animatable",
      "usesDOM": true,
      "needsCleanup": false
    },
    {
      "name": "Completable",
      "usesDOM": false,
      "needsCleanup": false
    },
    {
      "name": "Copiable",
      "usesDOM": false,
      "needsCleanup": false
    },
    {
      "name": "Delayable",
      "usesDOM": true,
      "needsCleanup": true
    },
    {
      "name": "Editable",
      "usesDOM": false,
      "needsCleanup": false
    },
    {
      "name": "Fetchable",
      "usesDOM": false,
      "needsCleanup": false
    },
    {
      "name": "IdentifiableGoTrue",
      "usesDOM": false,
      "needsCleanup": false
    },
    {
      "name": "Listenable",
      "usesDOM": true,
      "needsCleanup": true
    },
    {
      "name": "Navigable",
      "usesDOM": false,
      "needsCleanup": false
    },
    {
      "name": "Searchable",
      "usesDOM": false,
      "needsCleanup": false
    },
    {
      "name": "Togglable",
      "usesDOM": false,
      "needsCleanup": false
    }
  ],
  "subclasses": [
    {
      "name": "Markupable"
    },
    {
      "name": "Renamable"
    },
    {
      "name": "Reorderable"
    }
  ]
}