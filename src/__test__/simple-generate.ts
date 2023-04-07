import { simpleGenerate } from "../generate";
import { Input } from "../input";

const inputs: Input[] = [{
  type: 'example-json',
  value: `
    {
      test: /** xxx */ 'hhh', // hhh
    }
  `,
}];

simpleGenerate(inputs, { requestInterval: 500 })
  .then(code => console.log(code))
  .catch(error => console.log(error));
