// Browser-only fixture loaded by the isolated UAT server; excluded from the Vite build entry.
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import ManagePackageModal from "../src/components/ManagePackageModal";
import ManageTrainerModal from "../src/components/ManageTrainerModal";
import RateTrainerModal from "../src/components/RateTrainerModal";
import UpdateStudentProgressModal from "../src/components/UpdateStudentProgressModal";
import { trainersData } from "../src/data/mockData";

const components = {
  package: ManagePackageModal,
  trainer: ManageTrainerModal,
  review: RateTrainerModal,
  progress: UpdateStudentProgressModal,
};
let root;
export function mountModal(kind, props) {
  if (!root) {
    const host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
  }
  const input = { ...props };
  if (kind === "review")
    input.trainerToReview = trainersData[props.trainerIndex || 0];
  root.render(
    createElement(components[kind], {
      show: true,
      onHide: () => root.render(null),
      onSavePackage: () => {},
      onSaveTrainer: () => {},
      onSubmitReview: () => {},
      onUpdateProgress: () => {},
      ...input,
    }),
  );
}
