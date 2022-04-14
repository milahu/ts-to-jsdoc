import tsToJsdoc from '../index.js'
//import tsToJsdoc from 'ts-to-jsdoc'

import { suite } from 'uvu';
import * as assert from 'uvu/assert';

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const read = promisify(fs.readFile);
const write = promisify(fs.writeFile);
const exists = promisify(fs.exists);
const fixtures = path.resolve(__dirname, './fixtures');

const testSuite = suite('fixtures');

fs.readdirSync(fixtures).forEach(testname => {
  testSuite(testname, async () => {
    let infile = path.join(fixtures, testname, 'input.ts');
    let outfile = path.join(fixtures, testname, 'expect.js');
    //let actualfile = path.join(fixtures, testname, 'actual.js');

    let input = await read(infile, 'utf8');

    let actual;
    if (testname == 'empty-filename') {
      // special case
      actual = tsToJsdoc(input);
    }
    else {
      actual = tsToJsdoc(input, infile);
    }

    //console.log(`input:\n---\n${input}\n---\n\nactual:\n---\n${actual}\n---`) // debug

    if (await exists(outfile) == false || process.env['UPDATE_SNAPSHOTS']) {
      // save snapshot to file
      await write(outfile, actual);
      // no assert. we have no expect value here
    }
    else {
      let expect = await read(outfile, 'utf8')
      assert.fixture(actual, expect);
      // TODO else: write actual result to actualfile
    }
  });
});

testSuite.run();
