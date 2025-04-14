export interface ExampleConfig {
  name: string;
  responsePattern: string;
  regexPattern: string;
  responseType: string;
  markdown: string;
  css: string;
  style?: string;
  flags?: string;
  callback?: string;
}

export const examples: ExampleConfig[] = [
  {
    name: "AI Literacy Survey",
    responsePattern: "[[aiLiteracySurvey]]",
    regexPattern: "\\[\\[aiLiteracySurvey\\]\\]",
    responseType: "html",
    markdown: `<div class="survey-action">
  <h4 class="survey-title">Rate your "AI Literacy"</h4>
  <div class="survey-options">
    <form action="https://examples.llmasaservice.io/exampleform" method="GET" target="_blank">
      <input type="hidden" name="surveyResponse" value="Wizard">
      <button type="submit" class="survey-option">Wizard</button>
    </form>
    <form action="https://examples.llmasaservice.io/exampleform" method="GET" target="_blank">
      <input type="hidden" name="surveyResponse" value="Hacker">
      <button type="submit" class="survey-option">Hacker</button>
    </form>
    <form action="https://examples.llmasaservice.io/exampleform" method="GET" target="_blank">
      <input type="hidden" name="surveyResponse" value="Power User">
      <button type="submit" class="survey-option">Power User</button>
    </form>
    <form action="https://examples.llmasaservice.io/exampleform" method="GET" target="_blank">
      <input type="hidden" name="surveyResponse" value="Beginner">
      <button type="submit" class="survey-option">Beginner</button>
    </form>
    <form action="https://examples.llmasaservice.io/exampleform" method="GET" target="_blank">
      <input type="hidden" name="surveyResponse" value="Luddite">
      <button type="submit" class="survey-option">Luddite</button>
    </form>
  </div>
  <p class="survey-note">
    Clicking an option will open your response in a new tab.
  </p>
</div>`,
    css: `.survey-action {
  font-family: sans-serif;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 1em;
  max-width: 400px;
  margin: 1em auto;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.survey-title {
  margin-bottom: 1em;
  font-size: 1.2em;
  color: #333;
}
.survey-options {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
.survey-option {
  padding: 0.6em 1em;
  font-size: 1em;
  background-color: #fff5f5;
  border: 1px solid #dc2626;
  border-radius: 6px;
  color: #dc2626;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  width: 100%;
}
.survey-option:hover {
  background-color: #dc2626;
  color: white;
}
.survey-note {
  margin-top: 0.5em !important;
  font-size: 0.9em !important;
  color: rgb(102, 102, 102) !important;
}`
  },
  {
    name: "LLM as a Service Video",
    responsePattern: "[[llmAsAServiceVideo]]",
    regexPattern: "\\[\\[llmAsAServiceVideo\\]\\]",
    responseType: "markdown",
    markdown: "[![YouTube Thumbnail](https://img.youtube.com/vi/z-J8C4-So20/0.jpg)](https://www.youtube.com/watch?v=z-J8C4-So20)",
    css: ""
  },
  {
    name: "Yelp Search Link",
    responsePattern: "yelp[Joe's Pizza::pizza::New York City]",
    regexPattern: "[.\\s]*yelp\\[(.*)::(.*)::(.*)\\].*",
    responseType: "button",
    markdown: " [Joe's Pizza](https://www.yelp.com/search?find_desc=pizza&find_loc=New%20York%20City) ",
    style: "yelp-button",
    css: `.yelp-button {
  background-color: #d32323;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.yelp-button:hover {
  background-color: #b31e1e;
}

.yelp-button:before {
  content: "Y";
  font-family: "Yelp Sans", Arial, sans-serif;
  font-weight: 700;
  margin-right: 8px;
  font-size: 16px;
}`
  }
]; 