import { evaluateDebatePosition } from './services/ai';

async function main() {
  console.log("Starting test...");
  try {
    const res = await evaluateDebatePosition("The sky is blue.", "I think it is green.");
    console.log("Response:", res);
  } catch(e) {
    console.error("Error:", e);
  }
}
main();
