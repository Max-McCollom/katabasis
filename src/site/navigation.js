export function subsystemPath(item) {
  return '/system/' + (item.slug || item.id) + '/'
}
