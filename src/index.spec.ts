import defu from '@dword-design/defu';
import { expect, test } from '@playwright/test';
import depcheck from 'depcheck';
import endent from 'endent';
import outputFiles from 'output-files';

import self from '.';

const tests = {
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
};

for (const [name, _testConfig] of Object.entries(tests)) {
  test(name, async ({}, testInfo) => {
    const cwd = testInfo.outputPath();
    const { package: packageJson, file } = defu(_testConfig, { package: {} });

    await outputFiles(cwd, {
      'node_modules/foo/package.json': JSON.stringify({
        name: 'foo',
        ...packageJson,
      }),
      'src/index.js': file,
    });

    const result = await depcheck(cwd, {
      detectors: [self({ cwd })],
      package: { dependencies: { foo: '^1.0.0' } },
    });

    expect(result.dependencies).toEqual([]);
  });
}
