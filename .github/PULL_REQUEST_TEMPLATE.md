## Summary

<!-- One paragraph: what this PR does and why. Link ES/task ID if applicable. -->

## Type of change

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation
- [ ] Performance
- [ ] Release / chore

## Definition of Done

<!-- All items required before merge. See docs/08_Standards/DEFINITION_OF_DONE.md -->

### Automated (Quality Gate must be green)

- [ ] TypeScript passes (`npx tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Tests pass (`npm run test`)
- [ ] Coverage threshold met (`npm run test:coverage`)

### Manual attestation

- [ ] No console errors on affected routes
- [ ] No dead code introduced
- [ ] Documentation updated (paths: <!-- list -->)
- [ ] CHANGELOG updated (`docs/06_Releases/CHANGELOG.md`)
- [ ] Architecture unaffected or documented (ADR/DL/ES: <!-- ref or N/A -->)
- [ ] Accessibility maintained (UI changes only)
- [ ] Responsive layout verified (UI changes only)
- [ ] Security review completed
- [ ] Performance reviewed (hot paths / pipeline / bundle)

## Testing

<!-- How you verified. Include commands run. -->

```bash
# Example
npm run lint
npm run test
npm run build
```

## Screenshots / recordings

<!-- UI changes only. Delete if N/A. -->

## Related links

- ES / task:
- Decision Log:
- Issue:

## Reviewer notes

<!-- Optional context for reviewers. -->

---

**Reviewers:** Use [Code Review Checklist](docs/08_Standards/CODE_REVIEW_CHECKLIST.md) (OS-005).

**Quality Gate:** [QUALITY_GATE.md](docs/08_Standards/QUALITY_GATE.md)
