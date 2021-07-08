import { StrictMode } from "react";
import ReactDOM from "react-dom";
import AnnotaionDialog from "./App";
const briefing = {
  companySlug: "Hello",
  briefingId: 4
};

// const classes = {
//   topBar: "topBar",
//   stageWrapper: "stageWrapper",
//   dialogActions: "dialogActions",
//   dialogContent: "dialogContent"
// };
const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <h1>Annotaion</h1>
    <AnnotaionDialog
      briefing={briefing}
      mediaId={5}
      onChange
      Onclose
      open="false"
    />
  </StrictMode>,
  rootElement
);
