export default function toNodeList(arrayOfNodes) {
  return arrayOfNodes
    .reduce(
      (fragment, node) => {
        fragment.appendChild(node.cloneNode())
        return fragment
      },
      document.createDocumentFragment()
    )
    .childNodes
}
