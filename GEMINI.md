# Workspace Rules - Despensa Plus

## Project Mandate
All agent operations in this repository must comply with the custom skill [`project-development-workflow`](file:///.agents/skills/project-development-workflow/SKILL.md).

## Fundamental Principles
1. **Strict 10-Step Approval Cycle**: Never proceed to implementation, commits, merges, or phase transitions without explicit user authorization.
2. **No Unverified Claims**: Never state that a feature or fix works without empirical runtime verification output (test results or terminal logs).
3. **Version Control Safety**: Always inspect `git status` before making edits. Do not perform destructive git commands (`git reset --hard`, `git clean`) or overwrite user code without permission.
4. **No Feature Fabrication**: Implement strictly what is specified in approved documentation. Do not invent business logic or features independently.
5. **No Premature Code Development**: Do not develop application code during environment configuration or setup phases.
