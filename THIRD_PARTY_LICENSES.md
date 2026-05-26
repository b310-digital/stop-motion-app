# Third-Party Licenses

StopClip is released under the GNU Affero General Public License v3.0
(`AGPL-3.0-or-later`). This document records the third-party libraries that
participate in the media pipeline — capture, encoding, packaging, and download
— together with their licenses and roles. All other runtime and tooling
dependencies are declared in `package.json`; their full license set can be
inspected with `pnpm licenses list`.

## Media-pipeline dependencies

### gifenc

- **Role:** client-side GIF encoder; quantises frames and writes the GIF
  bitstream used by `MediaExportService.createGif`.
- **License:** MIT
- **Source:** https://github.com/mattdesl/gifenc
- **Copyright:** © 2017 Matt DesLauriers

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### @zip.js/zip.js

- **Role:** reads and writes the `.zip` project draft container
  (`MediaImportService`, `draft-export.ts`).
- **License:** BSD-3-Clause
- **Source:** https://github.com/gildas-lormeau/zip.js
- **Copyright:** © 2023 Gildas Lormeau

```
BSD 3-Clause License

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

### file-saver

- **Role:** triggers browser downloads for exported videos, GIFs, and drafts.
- **License:** MIT
- **Source:** https://github.com/eligrey/FileSaver.js
- **Copyright:** © 2016 Eli Grey

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### vite-plugin-pwa (Workbox)

- **Role:** generates the PWA service worker and web app manifest; the
  resulting bundle ships the `workbox-window` runtime to the client.
- **License:** MIT (plugin); the bundled Workbox runtime is MIT.
- **Source:** https://github.com/vite-pwa/vite-plugin-pwa,
  https://github.com/GoogleChrome/workbox

## Browser-native components

The remainder of the pipeline is provided by standard Web APIs and therefore
carries no third-party license obligation: `<canvas>` (frame rendering),
`MediaRecorder` (WebM/VP8 video and WebM/Opus audio encoding), `AudioContext`
(audio decoding and remuxing), and `createImageBitmap` /
`URL.createObjectURL` (frame decoding and download URLs).

The video and audio codecs themselves — VP8, Opus, WebP, WebM — are
royalty-free and require no per-distribution license.

## Project heritage

StopClip is a fork of the [kits stop-motion-app](https://gitlab.com/kits-apps/stop-motion-app),
which in turn was inspired by [Stop Motion Animator](https://github.com/szager/stop-motion)
by szager (BSD-0). No code from the original upstream project remains in the
React rewrite, but the attribution is preserved here in keeping with the
spirit of the BSD-0 license.

## License compatibility

The licenses listed above (MIT, BSD-3-Clause) are permissive and compatible
with redistribution under the AGPL-3.0-or-later terms of this project. The
upstream attribution in the heritage section above refers to BSD-0-licensed
code that no longer ships with the React rewrite.
