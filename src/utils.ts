import ReadStream = NodeJS.ReadStream;
import { Options, LongOption } from './main';
import { SourceDescription } from './sourceInfo';

export function readToBuffer(stream: ReadStream): Promise<Buffer> {
  return new Promise(resolve => {
    const ret: Array<Buffer | string> = [];
    let len = 0;
    stream.on('readable', () => {
      let chunk;
      while ((chunk = stream.read())) {
        ret.push(chunk);
        len += chunk.length;
      }
    });
    stream.on('end', () => {
      resolve(Buffer.concat(ret as any, len));
    });
  });
}

export function fail(message: string): never {
  throw new Error(message);
}

export function singular(name: string): string {
  return name.substring(0, name.length - 1); // drop the 's', which is extremely naive
}

export function lowerFirst(name: string): string {
  return name.substring(0, 1).toLowerCase() + name.substring(1);
}

export function upperFirst(name: string): string {
  return name.substring(0, 1).toUpperCase() + name.substring(1);
}

export function optionsFromParameter(parameter: string): Options {
  const options: Options = {
    useContext: false,
    snakeToCamel: true,
    forceLong: LongOption.NUMBER,
    outputEncodeMethods: true,
    outputJsonMethods: true,
    outputClientImpl: true,
    useEnumNames: false,
    outputNestJs: false,
  };

  if (parameter) {
    if (parameter.includes('context=true')) {
      options.useContext = true;
    }
    if (parameter.includes('snakeToCamel=false')) {
      options.snakeToCamel = false;
    }
    if (parameter.includes('forceLong=true') || parameter.includes('forceLong=long')) {
      options.forceLong = LongOption.LONG;
    }
    if (parameter.includes('forceLong=string')) {
      options.forceLong = LongOption.STRING;
    }
    if (parameter.includes('outputEncodeMethods=false')) {
      options.outputEncodeMethods = false;
    }
    if (parameter.includes('outputJsonMethods=false')) {
      options.outputJsonMethods = false;
    }
    if (parameter.includes('outputClientImpl=false')) {
      options.outputClientImpl = false;
    }
    if (parameter.includes('outputNestJs=true')) {
      options.outputNestJs = true;
    }
    if (parameter.includes('useEnumNames=false')) {
      options.useEnumNames = false;
    }
  }
  return options;
}

// addJavadoc will attempt to expand unescaped percent %, so we replace these within source comments.
const PercentAll = /\%/g;
// Since we don't know what form the comment originally took, it may contain closing block comments.
const CloseComment = /\*\//g;

/**
 * Removes potentially harmful characters from comments and calls the provided expression
 * @param desc {SourceDescription} original comment information
 * @param process {(comment: string) => void} called if a comment exists
 * @returns {string} scrubbed text
 */
export function maybeAddComment(desc: SourceDescription, process: (comment: string) => void): void {
  if (desc.leadingComments || desc.trailingComments) {
    return process(
      (desc.leadingComments || desc.trailingComments || '').replace(PercentAll, '%%').replace(CloseComment, '* /')
    );
  }
}

// util function to convert the input to string type
function convertToString(input: any) {

  if(input) {

    if(typeof input === "string") {

      return input;
    }

    return String(input);
  }
  return '';
}


// convert string to words
function toWords(input: string) {

  input = convertToString(input);

  var regex = /[A-Z\xC0-\xD6\xD8-\xDE]?[a-z\xDF-\xF6\xF8-\xFF]+|[A-Z\xC0-\xD6\xD8-\xDE]+(?![a-z\xDF-\xF6\xF8-\xFF])|\d+/g;

  return input.match(regex);

}


// convert the input array to camel case
function toCamelCase(inputArray: any) {

  let result = "";

  for(let i = 0 , len = inputArray.length; i < len; i++) {

    let currentStr = inputArray[i];

    let tempStr = currentStr.toLowerCase();

    if(i != 0) {

      // convert first letter to upper case (the word is in lowercase)
      tempStr = tempStr.substr(0, 1).toUpperCase() + tempStr.substr(1);

    }

    result +=tempStr;

  }

  return result;
}

export function toCamelCaseString(input: string) {

  let words = toWords(input);
  return toCamelCase(words);

}
