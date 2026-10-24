# Editing and contributing

Anyone can clone this public repository and edit it locally:

```sh
git clone https://github.com/AngryDavee/roadster-against-gravity.git
cd roadster-against-gravity
npm ci
npm start
```

Use Node 22.12+ and a WebGL2-capable browser. The first install downloads Puppeteer's test browser. The source film and final export are included, so the initial clone is larger than a code-only project. Read `HANDOFF.md` before editing.

To contribute without direct write access, fork the repository on GitHub, clone your fork, create a branch, commit changes, push the branch to your fork, and open a pull request to `AngryDavee/roadster-against-gravity`. Public access allows reading and forking; direct pushes require the owner to add you as a collaborator.

Run `npm run recipe:check` and `npm test`. For geometry work, also run the verifier and inspect its images. Include before/after frames for visual changes and explain any new warnings. Keep credentials out of commits. Regenerate the film only when the visual changes are ready; avoid repeatedly committing large intermediate exports.
