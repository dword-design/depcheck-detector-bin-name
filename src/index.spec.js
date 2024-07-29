import { endent } from '@dword-design/functions';
import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import depcheck from 'depcheck';
import outputFiles from 'output-files';

import self from './index.js';

export default tester(
  {
    'bin object': {
      file: endent`
        import binName from 'depcheck-bin-name'

        binName\`bar\`
      `,
      package: { bin: { bar: '' } },
    },
    'other import name': {
      file: endent`
        import depcheckBinName from 'depcheck-bin-name'

        depcheckBinName\`foo\`
      `,
      package: { bin: 'foo' },
    },
    'variable in literal': {
      file: endent`
        import binName from 'depcheck-bin-name'

        const bar = 1
        binName\`foo\${bar}\`
      `,
      package: { bin: 'foo' },
    },
    works: {
      file: endent`
        import binName from 'depcheck-bin-name'

        binName\`foo\`
      `,
      package: { bin: 'foo' },
    },
  },
  [
    testerPluginTmpDir(),
    {
      transform:
        ({ package: packageJson, file }) =>
        async () => {
          await outputFiles({
            'node_modules/foo/package.json': JSON.stringify({
              name: 'foo',
              ...packageJson,
            }),
            'src/index.js': file,
          });

          const result = await depcheck('.', {
            detectors: [self],
            package: {
              dependencies: {
                foo: '^1.0.0',
              },
            },
          });

          expect(result.dependencies).toEqual([]);
        },
    },
  ],
);
