export default function toObserver ({ eventType, listener, options }) {
  switch (eventType) {
    case 'intersect':
      return new IntersectionObserver(listener, options)
    case 'mutate':
      return new MutationObserver(listener, options)
    case 'resize':
      return new ResizeObserver(listener, options)
  }
}
