import { describe, it, expect } from 'vitest'
import bootstrapPkg from 'bootstrap/package.json'

// Vitest is configured with `css: false`, so a side-effect or `?raw` import
// of a `.css` file is stubbed to an empty string and any class-name assertion
// would silently pass even with Bootstrap uninstalled. Asserting against the
// installed `package.json` is the smallest check that actually fails when
// Bootstrap is missing or accidentally downgraded. The companion evidence
// that the CSS is shippable is the ~230 KB Bootstrap chunk emitted by
// `pnpm build` (see dist/assets/index-*.css after a build).
describe('Bootstrap grid', () => {
  it('has bootstrap@5.x installed and resolvable from this package', () => {
    expect(bootstrapPkg.name).toBe('bootstrap')
    expect(bootstrapPkg.version).toMatch(/^5\./)
    expect(bootstrapPkg.main ?? bootstrapPkg.module ?? '').toMatch(/bootstrap/)
  })
})
