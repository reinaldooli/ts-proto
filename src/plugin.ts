import { promisify } from 'util';
import { optionsFromParameter, readToBuffer } from './utils';
import { google } from '../build/pbjs';
import { generateFile } from './main';
import { createTypeMap } from './types';
import CodeGeneratorRequest = google.protobuf.compiler.CodeGeneratorRequest;
import CodeGeneratorResponse = google.protobuf.compiler.CodeGeneratorResponse;
import { FileSpec } from 'ts-poet';

// this would be the plugin called by the protoc compiler
async function main() {
  const stdin = await readToBuffer(process.stdin);
  // const json = JSON.parse(stdin.toString());
  // const request = CodeGeneratorRequest.fromObject(json);

  const request = CodeGeneratorRequest.decode(stdin);
  const typeMap = createTypeMap(request, optionsFromParameter(request.parameter));
  const files = request.protoFile.map((file) => {
    const spec = generateFile(typeMap, file, request.parameter);

    const filenames = spec.path.split('/');
    let filename = '';
    if (filenames[0] === 'google') {
      filename = spec.path;
    } else {
      filename = filenames[filenames.length - 1];
    }
    return new CodeGeneratorResponse.File({
      name: spec.path,
      content: prefixDisableLinter(spec),
    });
  });
  const response = new CodeGeneratorResponse({ file: files });
  const buffer = CodeGeneratorResponse.encode(response).finish();
  const write = promisify(process.stdout.write as (buffer: Buffer) => boolean).bind(process.stdout);
  await write(Buffer.from(buffer));
}

main()
  .then(() => {
    process.stderr.write('GEN DONE');
    process.exit(0);
  })
  .catch((e) => {
    process.stderr.write('FAILED!');
    process.stderr.write(e.message);
    process.stderr.write(e.stack);
    process.exit(1);
  });

// Comment block at the top of every source file, since these comments require specific
// syntax incompatible with ts-poet, we will hard-code the string and prepend to the
// generator output.
function prefixDisableLinter(spec: FileSpec): string {
  return `/* eslint-disable */
${spec}`;
}
