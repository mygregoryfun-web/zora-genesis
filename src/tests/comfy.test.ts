import assert from "node:assert/strict";
import test from "node:test";
import { applyComfyWorkflowInputs } from "../services/comfy.js";

test("updates a Comfy workflow prompt input", () => {
  const workflow = {
    "6": {
      class_type: "CLIPTextEncode",
      inputs: {
        text: "old prompt",
      },
    },
  };

  const updated = applyComfyWorkflowInputs(workflow, "new creator asset cover");

  assert.equal(updated["6"]?.inputs?.text, "new creator asset cover");
  assert.equal(workflow["6"]?.inputs?.text, "old prompt");
});
