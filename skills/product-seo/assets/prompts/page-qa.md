# Brief: tester pass on a task page

Fill the brackets and give this to a separate agent with a browser. Run it again after fixes: fixes break other things.

```
You are a tester. Check the page at [address or local file] as a visitor would use it. You did not build it and you owe it nothing.

What the page is for: [the task the visitor does on it]
The path to walk: [for example: choose a file, see the sign-in window, sign in, land on the result]

Check at these widths: 1440, 1024, 768, 390. If the site has a dark theme, check both themes.

At each width:
1. Layout: nothing overlaps, nothing is cut off, no sideways scroll, sections do not run together, text is readable.
2. The main action is visible without scrolling and works.
3. Walk the whole path. Then walk it wrong: an unsupported file, an oversized file, an empty field, closing the window halfway, going back.
4. Every link opens the right place. Every image loads, including after scrolling to the bottom.
5. Every promise in the text matches what actually happens on the path.

Also check once:
- one H1; the title and description are present;
- the FAQ questions in the structured data match the visible questions word for word;
- the browser console shows no errors.

Report:
- a list of problems, each with: width and theme, what you did, what you expected, what happened, a screenshot, and severity (blocks the task / looks broken / minor);
- an overall look-and-feel score from 1 to 10 with one sentence of reasoning;
- what you could not check.

Do not fix anything. Do not suggest redesigns.
```
