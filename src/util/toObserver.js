export default function toObserver ({ type, listener, options }) {
  switch (type) {
    case 'intersect':
      return new IntersectionObserver(listener, options)
    case 'mutate':
      return new MutationObserver(listener, options)
    case 'resize':
      return new ResizeObserver(listener, options)
  }
}
